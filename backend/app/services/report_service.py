from app.services.database import get_database
from bson import ObjectId
from datetime import datetime
import io
import re
import os
import json
import base64

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False

try:
    import requests as http_requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"
GROQ_VISION_MODEL = "llama-3.2-90b-vision-preview"


def _clean_llm_json(text: str) -> dict:
    """Parse JSON from LLM response, stripping markdown fences if present."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
        cleaned = re.sub(r'\s*```$', '', cleaned)
    return json.loads(cleaned)


class ReportService:

    def _extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF using PyMuPDF."""
        if not PYMUPDF_AVAILABLE:
            return ""
        try:
            doc = fitz.open(stream=file_content, filetype="pdf")
            text = "".join(page.get_text() for page in doc)
            doc.close()
            return text
        except Exception as e:
            print(f"PDF extraction error: {e}")
            return ""

    def _classify_document(self, text: str) -> str:
        """Classify document type based on keywords."""
        text_lower = text.lower()
        keywords = {
            "lab_report": ["hemoglobin", "rbc", "wbc", "platelet", "blood count", "cbc"],
            "prescription": ["prescription", "rx", "tab.", "cap.", "syrup"],
            "discharge_summary": ["discharge", "admitted", "discharged"],
            "radiology_report": ["x-ray", "xray", "radiograph", "ct scan", "mri"],
        }
        for doc_type, words in keywords.items():
            if any(w in text_lower for w in words):
                return doc_type
        return "general_report"

    def _extract_medical_data(self, text: str) -> dict:
        """Extract structured medical data from report text."""
        data = {
            "patient_name": "", "doctor_name": "", "date": "",
            "medicines": [], "test_results": [], "diagnosis": [], "abnormal_values": []
        }
        for line in text.split("\n"):
            line_s = line.strip()
            line_l = line.lower()

            if "patient" in line_l and "name" in line_l and ":" in line_s:
                data["patient_name"] = line_s.split(":")[-1].strip()
            if "dr." in line_l or "doctor" in line_l:
                data["doctor_name"] = line_s
            if any(w in line_l for w in ["tab.", "cap.", "syrup", "injection", "mg"]):
                data["medicines"].append(line_s)

            # Hemoglobin check
            hb = re.findall(r'hemoglobin[:\s]*(\d+\.?\d*)', line_l)
            if hb:
                val = float(hb[0])
                result = {"test": "Hemoglobin", "value": str(val), "unit": "g/dL"}
                if val < 12:
                    result["status"] = "LOW"
                    data["abnormal_values"].append(result)
                data["test_results"].append(result)

            # Blood sugar check
            sugar = re.findall(r'(?:blood sugar|glucose|fasting)[:\s]*(\d+\.?\d*)', line_l)
            if sugar:
                val = float(sugar[0])
                result = {"test": "Blood Sugar", "value": str(val), "unit": "mg/dL"}
                if val > 126:
                    result["status"] = "HIGH"
                    data["abnormal_values"].append(result)
                data["test_results"].append(result)

        return data

    def _call_llm_text(self, prompt: str) -> str:
        """Call Groq API (Llama 3.3) with a text-only prompt."""
        if not GROQ_API_KEY or not REQUESTS_AVAILABLE:
            print("[Report Groq] Skipped — API key not configured")
            return ""
        try:
            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": GROQ_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 2048
            }
            resp = http_requests.post(GROQ_URL, json=payload, headers=headers, timeout=30)
            if resp.status_code == 200:
                return resp.json()["choices"][0]["message"]["content"]
            else:
                print(f"[Report Groq] HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[Report Groq] Error: {e}")
        return ""

    def _call_llm_vision(self, file_content: bytes, file_type: str) -> dict:
        """Call Groq Vision API (Llama 3.2 Vision) for image analysis."""
        if not GROQ_API_KEY or not REQUESTS_AVAILABLE:
            return {}
        try:
            b64_data = base64.b64encode(file_content).decode("utf-8")
            mime = {"image/jpeg": "image/jpeg", "image/jpg": "image/jpeg",
                    "image/png": "image/png", "image/webp": "image/webp",
                    "application/pdf": "application/pdf"}.get(file_type, "image/jpeg")

            # Groq vision does not support PDF inline — fall back to text extraction for PDFs
            if mime == "application/pdf":
                return {}

            prompt_text = (
                "You are AroNexa, an expert AI medical report analyzer for rural Indian healthcare. "
                "Analyze this medical document thoroughly. "
                "Return ONLY a raw JSON object with these keys (no markdown):\n"
                '{"summary": "...", "suggestions": ["..."], "risk_level": "low/medium/high", '
                '{"risk_explanation": "...", "when_to_see_doctor": "...", "diet_advice": "...", '
                '"lifestyle_advice": "...", "findings": [{"test": "...", "value": "...", "unit": "...", "status": "..."}], '
                '"abnormal_values": [...], "medicines_found": [...]}'
            )

            headers = {
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": GROQ_VISION_MODEL,
                "messages": [{
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt_text},
                        {"type": "image_url", "image_url": {"url": f"data:{mime};base64,{b64_data}"}}
                    ]
                }],
                "temperature": 0.2,
                "max_tokens": 2048
            }
            resp = http_requests.post(GROQ_URL, json=payload, headers=headers, timeout=60)
            if resp.status_code == 200:
                text = resp.json()["choices"][0]["message"]["content"]
                return _clean_llm_json(text)
            else:
                print(f"[Report Vision] HTTP {resp.status_code}: {resp.text[:200]}")
        except Exception as e:
            print(f"[Report Vision] Error: {e}")
        return {}

    def _generate_ai_summary(self, text: str, doc_type: str, extracted_data: dict) -> dict:
        """Generate AI summary using Groq (Llama), with fallback."""
        prompt = (
            "You are AroNexa, an AI medical report analyzer for rural Indian healthcare. "
            f"Analyze this {doc_type.replace('_', ' ')} report.\n\n"
            f"Text:\n{text[:3000]}\n\n"
            f"Medicines: {', '.join(extracted_data.get('medicines', [])) or 'None'}\n"
            f"Abnormal Values: {json.dumps(extracted_data.get('abnormal_values', []))}\n\n"
            "Return ONLY a JSON object:\n"
            '{"summary": "...", "suggestions": ["..."], "risk_level": "low/medium/high", '
            '"risk_explanation": "...", "when_to_see_doctor": "...", "diet_advice": "...", '
            '"lifestyle_advice": "..."}'
        )

        response = self._call_llm_text(prompt)
        if response:
            try:
                return _clean_llm_json(response)
            except json.JSONDecodeError:
                return {"summary": response[:1000], "suggestions": ["Consult your doctor"],
                        "risk_level": "medium", "risk_explanation": "Unable to fully analyze.",
                        "when_to_see_doctor": "Visit your doctor soon.",
                        "diet_advice": "Maintain a balanced diet.", "lifestyle_advice": "Exercise regularly."}

        # Fallback when Groq is unavailable
        return self._generate_fallback(doc_type, extracted_data)

    def _generate_fallback(self, doc_type: str, extracted_data: dict) -> dict:
        """Fallback summary when Groq is unavailable."""
        parts = [f"📄 Document Type: {doc_type.replace('_', ' ').title()}"]
        if extracted_data.get("patient_name"):
            parts.append(f"👤 Patient: {extracted_data['patient_name']}")
        if extracted_data.get("medicines"):
            parts.append(f"💊 Medicines: {len(extracted_data['medicines'])} found")
        if extracted_data.get("abnormal_values"):
            parts.append("⚠️ Abnormal values detected")
        if len(parts) <= 1:
            parts.append("Report uploaded. AI analysis requires Groq API key.")

        return {
            "summary": "\n".join(parts),
            "suggestions": ["Show this report to your doctor", "Keep for future reference",
                            "Take medicines on time", "Follow up as recommended", "Stay hydrated"],
            "risk_level": "medium" if extracted_data.get("abnormal_values") else "low",
            "risk_explanation": "Abnormal values detected" if extracted_data.get("abnormal_values") else "No critical issues",
            "when_to_see_doctor": "Visit your doctor within 2-3 days",
            "diet_advice": "Eat balanced meals with fruits and vegetables",
            "lifestyle_advice": "Get regular exercise and adequate sleep"
        }

    def _build_ai_summary_text(self, ai_analysis: dict) -> str:
        """Build the final AI summary string from analysis dict."""
        summary = ai_analysis.get("summary", "Report processed successfully.")

        if ai_analysis.get("suggestions"):
            summary += "\n\n💡 Health Suggestions:\n"
            for i, s in enumerate(ai_analysis["suggestions"][:5], 1):
                summary += f"  {i}. {s}\n"
        if ai_analysis.get("when_to_see_doctor"):
            summary += f"\n👨‍⚕️ Doctor Visit: {ai_analysis['when_to_see_doctor']}"
        if ai_analysis.get("diet_advice"):
            summary += f"\n🥗 Diet: {ai_analysis['diet_advice']}"

        summary += "\n\n⚠️ Note: This is an AI-generated analysis. Please consult your doctor."
        return summary

    async def process_report(self, user_id: str, file_name: str, file_content: bytes,
                             file_type: str, document_type: str = "auto") -> dict:
        """Process uploaded medical report with AI analysis."""
        db = get_database()

        # Step 1: Extract text from PDF
        extracted_text = ""
        if "pdf" in file_type.lower():
            extracted_text = self._extract_text_from_pdf(file_content)

        # Step 2: Use Groq Vision for images or scanned PDFs
        ai_analysis = None
        if not extracted_text.strip():
            ai_analysis = self._call_llm_vision(file_content, file_type)
            if not ai_analysis:
                extracted_text = "Document uploaded. Text could not be extracted."

        # Step 3: Auto-classify
        if document_type == "auto":
            document_type = self._classify_document(extracted_text) if extracted_text.strip() else "general_report"

        # Step 4: Extract structured data
        extracted_data = self._extract_medical_data(extracted_text) if extracted_text.strip() else {
            "patient_name": "", "doctor_name": "", "date": "",
            "medicines": [], "test_results": [], "diagnosis": [], "abnormal_values": []
        }

        # Step 5: Generate AI analysis
        if not ai_analysis:
            if extracted_text.strip() and "could not be extracted" not in extracted_text:
                ai_analysis = self._generate_ai_summary(extracted_text, document_type, extracted_data)
            else:
                ai_analysis = self._generate_fallback(document_type, extracted_data)

        # Merge Groq findings into extracted_data
        for src, dst in [("findings", "test_results"), ("medicines_found", "medicines"), ("abnormal_values", "abnormal_values")]:
            if src in ai_analysis and not extracted_data.get(dst):
                extracted_data[dst] = ai_analysis[src]

        # Step 6: Build report record
        report = {
            "user_id": user_id,
            "file_name": file_name,
            "file_type": file_type,
            "document_type": document_type,
            "extracted_text": extracted_text[:5000],
            "extracted_data": extracted_data,
            "ai_summary": self._build_ai_summary_text(ai_analysis),
            "ai_suggestions": ai_analysis.get("suggestions", []),
            "risk_level": ai_analysis.get("risk_level", "low"),
            "risk_explanation": ai_analysis.get("risk_explanation", ""),
            "when_to_see_doctor": ai_analysis.get("when_to_see_doctor", ""),
            "diet_advice": ai_analysis.get("diet_advice", ""),
            "lifestyle_advice": ai_analysis.get("lifestyle_advice", ""),
            "findings": extracted_data.get("test_results", []),
            "medicines_found": extracted_data.get("medicines", []),
            "abnormal_values": extracted_data.get("abnormal_values", []),
            "created_at": datetime.utcnow()
        }

        result = await db.reports.insert_one(report)

        # Return the same report with id (avoid duplicating all fields)
        report["id"] = str(result.inserted_id)
        report["created_at"] = str(report["created_at"])
        report["extracted_text"] = extracted_text[:2000]
        report.pop("_id", None)
        return report

    async def get_user_reports(self, user_id: str) -> list:
        """Get all reports for a user, sorted by newest first."""
        db = get_database()
        reports = []
        async for report in db.reports.find({"user_id": user_id}).sort("created_at", -1):
            report["id"] = str(report.pop("_id"))
            report["created_at"] = str(report.get("created_at", ""))
            reports.append(report)
        return reports

    async def get_report_by_id(self, report_id: str) -> dict:
        """Get a single report by ID."""
        db = get_database()
        report = await db.reports.find_one({"_id": ObjectId(report_id)})
        if report:
            report["id"] = str(report.pop("_id"))
            report["created_at"] = str(report.get("created_at", ""))
            return report
        return None