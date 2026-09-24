from app.services.database import get_database
from app.services.hospital_service import HospitalService
from bson import ObjectId
from datetime import datetime
from typing import Optional
import re
import os
import json

try:
    import requests as http_requests
    REQUESTS_AVAILABLE = True
except ImportError:
    REQUESTS_AVAILABLE = False

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_MODEL = "llama-3.3-70b-versatile"

hospital_service = HospitalService()


# =============================================================================
# Groq/Llama Translation Helper
# =============================================================================

def _call_llm(prompt: str, temperature: float = 0.2, timeout: int = 30) -> str:
    """Call Groq API (Llama 3.3) and return raw text response."""
    if not GROQ_API_KEY or not REQUESTS_AVAILABLE:
        print("[Groq] Skipped — API key not configured")
        return ""
    try:
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": GROQ_MODEL,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            "max_tokens": 2048
        }
        resp = http_requests.post(GROQ_URL, json=payload, headers=headers, timeout=timeout)
        if resp.status_code == 200:
            return resp.json()["choices"][0]["message"]["content"]
        else:
            print(f"[Groq] HTTP {resp.status_code}: {resp.text[:200]}")
    except Exception as e:
        print(f"[Groq] Error: {e}")
    return ""


def _clean_json(text: str) -> dict:
    """Parse JSON from LLM response, stripping markdown fences."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r'^```(?:json)?\s*', '', cleaned)
        cleaned = re.sub(r'\s*```$', '', cleaned)
    return json.loads(cleaned)


def translate_response_with_llm(response_data: dict, target_language: str) -> dict:
    """Translate the triage response to the target language using Groq (Llama)."""
    if not GROQ_API_KEY or target_language == "english":
        return response_data

    LANGUAGE_NAMES = {
        "gujarati": "Gujarati (ગુજરાતી)", "hindi": "Hindi (हिंदी)",
        "tamil": "Tamil (தமிழ்)", "marathi": "Marathi (मराठी)",
        "bengali": "Bengali (বাংলা)", "telugu": "Telugu (తెలుగు)",
        "kannada": "Kannada (ಕನ್ನಡ)", "malayalam": "Malayalam (മലയാളം)",
    }
    lang_name = LANGUAGE_NAMES.get(target_language, target_language)

    to_translate = {
        "recommendations": response_data.get("recommendations", []),
        "precautions": response_data.get("precautions", []),
        "when_to_see_doctor": response_data.get("when_to_see_doctor", ""),
        "disclaimer": response_data.get("disclaimer", ""),
        "possible_conditions": response_data.get("possible_conditions", []),
    }
    med_dosages = [m.get("dosage", "") for m in response_data.get("medicines_info", [])]

    prompt = (
        f"Translate the following medical guidance from English to {lang_name}. "
        f"Keep medicine names and phone numbers as-is. Return ONLY a JSON object.\n\n"
        f"Input: {json.dumps(to_translate, ensure_ascii=False)}\n"
        f"Dosages: {json.dumps(med_dosages, ensure_ascii=False)}\n\n"
        "Format: {\"recommendations\": [...], \"precautions\": [...], "
        "\"when_to_see_doctor\": \"...\", \"disclaimer\": \"...\", "
        "\"possible_conditions\": [...], \"dosages\": [...]}\n"
        "IMPORTANT: Return ONLY the JSON object."
    )

    try:
        text = _call_llm(prompt)
        if text:
            translated = _clean_json(text)
            # Apply translations
            for key in ["recommendations", "precautions", "when_to_see_doctor", "disclaimer", "possible_conditions"]:
                if translated.get(key):
                    response_data[key] = translated[key]
            # Apply translated dosages
            for i, med in enumerate(response_data.get("medicines_info", [])):
                if i < len(translated.get("dosages", [])):
                    med["dosage"] = translated["dosages"][i]
            response_data["response_language"] = target_language
    except Exception as e:
        print(f"Translation error: {e}")

    return response_data


# =============================================================================
# SYMPTOM DATABASE — Rule-Based Triage Engine
# =============================================================================

SYMPTOM_DATABASE = {
    # EMERGENCY (RED)
    "chest pain": {"urgency": "emergency", "conditions": ["Heart Attack", "Angina", "Pulmonary Embolism"], "score": 10},
    "breathing difficulty": {"urgency": "emergency", "conditions": ["Asthma Attack", "Pneumonia", "Heart Failure"], "score": 10},
    "breathlessness": {"urgency": "emergency", "conditions": ["Asthma", "COPD", "Pneumonia"], "score": 10},
    "unconscious": {"urgency": "emergency", "conditions": ["Stroke", "Seizure", "Cardiac Arrest"], "score": 10},
    "severe bleeding": {"urgency": "emergency", "conditions": ["Hemorrhage", "Trauma"], "score": 10},
    "seizure": {"urgency": "emergency", "conditions": ["Epilepsy", "Brain Injury"], "score": 10},
    "paralysis": {"urgency": "emergency", "conditions": ["Stroke", "Spinal Injury"], "score": 10},
    "sudden weakness": {"urgency": "emergency", "conditions": ["Stroke", "TIA"], "score": 9},
    "high fever above 104": {"urgency": "emergency", "conditions": ["Severe Infection", "Meningitis"], "score": 9},
    "blood in vomit": {"urgency": "emergency", "conditions": ["GI Bleeding", "Ulcer"], "score": 9},
    "blood in stool": {"urgency": "emergency", "conditions": ["GI Bleeding", "Hemorrhoids"], "score": 8},
    "severe abdominal pain": {"urgency": "emergency", "conditions": ["Appendicitis", "Pancreatitis"], "score": 9},
    "snake bite": {"urgency": "emergency", "conditions": ["Snake Envenomation"], "score": 10},
    "poisoning": {"urgency": "emergency", "conditions": ["Toxic Ingestion"], "score": 10},
    "burn": {"urgency": "emergency", "conditions": ["Burn Injury"], "score": 8},
    "accident": {"urgency": "emergency", "conditions": ["Trauma", "Fracture"], "score": 9},
    "fracture": {"urgency": "emergency", "conditions": ["Bone Fracture"], "score": 8},

    # VISIT CLINIC (YELLOW)
    "fever": {"urgency": "visit-clinic", "conditions": ["Viral Fever", "Malaria", "Dengue", "Typhoid"], "score": 5},
    "high fever": {"urgency": "visit-clinic", "conditions": ["Malaria", "Dengue", "Typhoid"], "score": 7},
    "persistent fever": {"urgency": "visit-clinic", "conditions": ["Typhoid", "TB", "Chronic Infection"], "score": 7},
    "vomiting": {"urgency": "visit-clinic", "conditions": ["Gastritis", "Food Poisoning", "Viral Infection"], "score": 5},
    "diarrhea": {"urgency": "visit-clinic", "conditions": ["Gastroenteritis", "Food Poisoning", "Cholera"], "score": 5},
    "severe diarrhea": {"urgency": "visit-clinic", "conditions": ["Cholera", "Dysentery"], "score": 7},
    "cough": {"urgency": "visit-clinic", "conditions": ["Bronchitis", "TB", "Pneumonia"], "score": 4},
    "persistent cough": {"urgency": "visit-clinic", "conditions": ["TB", "Chronic Bronchitis", "Asthma"], "score": 6},
    "blood in cough": {"urgency": "visit-clinic", "conditions": ["TB", "Lung Cancer"], "score": 8},
    "weight loss": {"urgency": "visit-clinic", "conditions": ["TB", "Diabetes", "Cancer"], "score": 6},
    "night sweats": {"urgency": "visit-clinic", "conditions": ["TB", "HIV", "Lymphoma"], "score": 6},
    "joint pain": {"urgency": "visit-clinic", "conditions": ["Arthritis", "Chikungunya", "Dengue"], "score": 4},
    "swelling": {"urgency": "visit-clinic", "conditions": ["Infection", "Arthritis", "Injury"], "score": 4},
    "rash": {"urgency": "visit-clinic", "conditions": ["Allergy", "Dengue", "Measles", "Chickenpox"], "score": 4},
    "skin rash": {"urgency": "visit-clinic", "conditions": ["Dermatitis", "Fungal Infection", "Allergy"], "score": 4},
    "ear pain": {"urgency": "visit-clinic", "conditions": ["Ear Infection", "Otitis Media"], "score": 4},
    "eye pain": {"urgency": "visit-clinic", "conditions": ["Conjunctivitis", "Glaucoma"], "score": 5},
    "blurred vision": {"urgency": "visit-clinic", "conditions": ["Diabetes", "Glaucoma", "Cataract"], "score": 6},
    "abdominal pain": {"urgency": "visit-clinic", "conditions": ["Gastritis", "Ulcer", "IBS"], "score": 5},
    "stomach pain": {"urgency": "visit-clinic", "conditions": ["Gastritis", "Acidity", "Ulcer"], "score": 4},
    "back pain": {"urgency": "visit-clinic", "conditions": ["Muscle Strain", "Disc Problem", "Kidney Stone"], "score": 4},
    "urination problem": {"urgency": "visit-clinic", "conditions": ["UTI", "Kidney Stone", "Prostate"], "score": 5},
    "burning urination": {"urgency": "visit-clinic", "conditions": ["UTI", "STI"], "score": 5},
    "irregular periods": {"urgency": "visit-clinic", "conditions": ["PCOS", "Thyroid", "Hormonal Imbalance"], "score": 5},
    "weakness": {"urgency": "visit-clinic", "conditions": ["Anemia", "Diabetes", "Thyroid"], "score": 4},
    "fatigue": {"urgency": "visit-clinic", "conditions": ["Anemia", "Thyroid", "Diabetes"], "score": 4},
    "dizziness": {"urgency": "visit-clinic", "conditions": ["Low BP", "Anemia", "Vertigo"], "score": 5},
    "chest tightness": {"urgency": "visit-clinic", "conditions": ["Asthma", "Anxiety", "GERD"], "score": 6},
    "palpitations": {"urgency": "visit-clinic", "conditions": ["Arrhythmia", "Anxiety", "Thyroid"], "score": 6},

    # SELF-CARE (GREEN)
    "cold": {"urgency": "self-care", "conditions": ["Common Cold", "Viral Infection"], "score": 2},
    "common cold": {"urgency": "self-care", "conditions": ["Common Cold"], "score": 2},
    "mild fever": {"urgency": "self-care", "conditions": ["Viral Fever", "Common Cold"], "score": 3},
    "low fever": {"urgency": "self-care", "conditions": ["Viral Fever", "Mild Infection"], "score": 3},
    "runny nose": {"urgency": "self-care", "conditions": ["Common Cold", "Allergy"], "score": 2},
    "sneezing": {"urgency": "self-care", "conditions": ["Common Cold", "Allergy"], "score": 2},
    "mild headache": {"urgency": "self-care", "conditions": ["Tension Headache", "Eye Strain"], "score": 2},
    "headache": {"urgency": "self-care", "conditions": ["Tension Headache", "Migraine", "Stress"], "score": 3},
    "sore throat": {"urgency": "self-care", "conditions": ["Pharyngitis", "Common Cold"], "score": 2},
    "body ache": {"urgency": "self-care", "conditions": ["Viral Fever", "Muscle Fatigue"], "score": 3},
    "muscle pain": {"urgency": "self-care", "conditions": ["Muscle Strain", "Overexertion"], "score": 2},
    "mild cough": {"urgency": "self-care", "conditions": ["Common Cold", "Throat Irritation"], "score": 2},
    "acidity": {"urgency": "self-care", "conditions": ["GERD", "Acid Reflux"], "score": 2},
    "gas": {"urgency": "self-care", "conditions": ["Indigestion", "IBS"], "score": 2},
    "bloating": {"urgency": "self-care", "conditions": ["Indigestion", "IBS"], "score": 2},
    "constipation": {"urgency": "self-care", "conditions": ["Constipation", "Low Fiber Diet"], "score": 2},
    "minor cut": {"urgency": "self-care", "conditions": ["Minor Wound"], "score": 1},
    "insomnia": {"urgency": "self-care", "conditions": ["Sleep Disorder", "Stress"], "score": 2},
    "stress": {"urgency": "self-care", "conditions": ["Anxiety", "Stress"], "score": 2},
    "mild allergy": {"urgency": "self-care", "conditions": ["Mild Allergic Reaction"], "score": 2},
}


# =============================================================================
# MULTILINGUAL SYMPTOM MAPS
# =============================================================================

SYMPTOM_TRANSLATIONS = {
    "gujarati": {
        "છાતીમાં દુઃખાવો": "chest pain", "છાતી દુખે": "chest pain",
        "શ્વાસ લેવામાં તકલીફ": "breathing difficulty", "શ્વાસ ન આવે": "breathlessness",
        "બેભાન": "unconscious", "લોહી વહે": "severe bleeding", "હુમલો": "seizure",
        "લકવો": "paralysis", "અચાનક નબળાઈ": "sudden weakness",
        "ઝેર ખાધું": "poisoning", "સાપ કરડ્યો": "snake bite",
        "ઈજા": "accident", "અકસ્માત": "accident",
        "હાડકું ભાંગ્યું": "fracture", "દાઝ્યો": "burn",
        "તાવ": "fever", "ઊંચો તાવ": "high fever", "ઉલ્ટી": "vomiting", "ઊલટી": "vomiting",
        "ઝાડા": "diarrhea", "ઝાડ": "diarrhea", "ઉધરસ": "cough", "ખાંસી": "cough",
        "સખત ઉધરસ": "persistent cough", "વજન ઘટવું": "weight loss",
        "રાત્રે પરસેવો": "night sweats", "સાંધા દુખે": "joint pain",
        "સોજો": "swelling", "ચાંભા": "rash", "ખૂજલી": "rash",
        "કાન દુખે": "ear pain", "આંખ દુખે": "eye pain", "ઝાંખું દેખાય": "blurred vision",
        "પેટ દુખે": "stomach pain", "પેટ દુઃખાવો": "abdominal pain",
        "કમર દુખે": "back pain", "પેશાબ બળે": "burning urination",
        "નબળાઈ": "weakness", "થાક": "fatigue", "ચક્કર": "dizziness", "ધબકારા": "palpitations",
        "શરદી": "cold", "સળેખમ": "cold", "નાક વહે": "runny nose", "છીંક": "sneezing",
        "માથું દુખે": "headache", "માથાનો દુઃખાવો": "headache",
        "ગળું દુખે": "sore throat", "અંગ દુઃખાવો": "body ache", "સ્નાયુ દુખે": "muscle pain",
        "એસિડિટી": "acidity", "ગેસ": "gas", "ગ્રહણી": "bloating",
        "કબજિયાત": "constipation", "ઊંઘ ન આવે": "insomnia", "તણાવ": "stress",
        "ભૂખ ન લાગે": "fatigue", "હળવો તાવ": "mild fever", "ઓછો તાવ": "low fever",
    },
    "hindi": {
        "सीने में दर्द": "chest pain", "छाती में दर्द": "chest pain",
        "सांस लेने में तकलीफ": "breathing difficulty", "सांस नहीं आती": "breathlessness",
        "बेहोश": "unconscious", "खून बह रहा है": "severe bleeding", "दौरा": "seizure",
        "लकवा": "paralysis", "अचानक कमजोरी": "sudden weakness",
        "जहर खाया": "poisoning", "सांप ने काटा": "snake bite",
        "दुर्घटना": "accident", "हड्डी टूटी": "fracture", "जल गया": "burn",
        "बुखार": "fever", "तेज बुखार": "high fever", "उल्टी": "vomiting",
        "दस्त": "diarrhea", "खांसी": "cough", "लगातार खांसी": "persistent cough",
        "वजन कम होना": "weight loss", "रात को पसीना": "night sweats",
        "जोड़ों में दर्द": "joint pain", "सूजन": "swelling",
        "चकत्ते": "rash", "खुजली": "rash", "कान में दर्द": "ear pain",
        "आंख में दर्द": "eye pain", "धुंधला दिखना": "blurred vision",
        "पेट दर्द": "stomach pain", "पीठ दर्द": "back pain",
        "पेशाब में जलन": "burning urination", "कमजोरी": "weakness",
        "थकान": "fatigue", "चक्कर": "dizziness", "घबराहट": "palpitations",
        "सर्दी": "cold", "जुकाम": "cold", "नाक बहना": "runny nose", "छींक": "sneezing",
        "सिर दर्द": "headache", "गले में दर्द": "sore throat", "बदन दर्द": "body ache",
        "मांसपेशियों में दर्द": "muscle pain", "एसिडिटी": "acidity", "गैस": "gas",
        "कब्ज": "constipation", "नींद नहीं आती": "insomnia", "तनाव": "stress",
        "हल्का बुखार": "mild fever",
    },
    "marathi": {
        "छातीत दुखणे": "chest pain", "छातीत वेदना": "chest pain",
        "श्वास घेण्यास त्रास": "breathing difficulty", "श्वास लागणे": "breathlessness",
        "बेशुद्ध": "unconscious", "रक्तस्त्राव": "severe bleeding", "झटका": "seizure",
        "अर्धांगवायू": "paralysis", "अचानक अशक्तपणा": "sudden weakness",
        "विष खाल्ले": "poisoning", "साप चावला": "snake bite",
        "अपघात": "accident", "हाड मोडले": "fracture", "भाजले": "burn",
        "ताप": "fever", "खूप ताप": "high fever", "उलटी": "vomiting",
        "जुलाब": "diarrhea", "खोकला": "cough", "सतत खोकला": "persistent cough",
        "वजन कमी होणे": "weight loss", "रात्री घाम": "night sweats",
        "सांधेदुखी": "joint pain", "सूज": "swelling", "पुरळ": "rash", "खाज": "rash",
        "कान दुखणे": "ear pain", "डोळा दुखणे": "eye pain", "अंधुक दिसणे": "blurred vision",
        "पोटदुखी": "stomach pain", "पाठदुखी": "back pain",
        "लघवीला जळजळ": "burning urination", "अशक्तपणा": "weakness",
        "थकवा": "fatigue", "चक्कर": "dizziness", "धडधडणे": "palpitations",
        "सर्दी": "cold", "नाक वाहणे": "runny nose", "शिंका": "sneezing",
        "डोकेदुखी": "headache", "घसा दुखणे": "sore throat",
        "अंगदुखी": "body ache", "स्नायू दुखणे": "muscle pain",
        "ॲसिडिटी": "acidity", "गॅस": "gas", "बद्धकोष्ठता": "constipation",
        "झोप न लागणे": "insomnia", "ताण": "stress", "हलका ताप": "mild fever",
    },
    "tamil": {
        "நெஞ்சு வலி": "chest pain", "மூச்சு விடுவதில் சிரமம்": "breathing difficulty",
        "மூச்சு திணறல்": "breathlessness", "மயக்கம்": "unconscious",
        "அதிக இரத்தப்போக்கு": "severe bleeding", "வலிப்பு": "seizure",
        "பக்கவாதம்": "paralysis", "திடீர் பலவீனம்": "sudden weakness",
        "விஷம் சாப்பிட்டது": "poisoning", "பாம்பு கடி": "snake bite",
        "விபத்து": "accident", "எலும்பு முறிவு": "fracture", "தீக்காயம்": "burn",
        "காய்ச்சல்": "fever", "அதிக காய்ச்சல்": "high fever", "வாந்தி": "vomiting",
        "வயிற்றுப்போக்கு": "diarrhea", "இருமல்": "cough", "தொடர் இருமல்": "persistent cough",
        "எடை குறைவு": "weight loss", "இரவு வியர்வை": "night sweats",
        "மூட்டு வலி": "joint pain", "வீக்கம்": "swelling", "தடிப்பு": "rash", "அரிப்பு": "rash",
        "காது வலி": "ear pain", "கண் வலி": "eye pain", "மங்கலான பார்வை": "blurred vision",
        "வயிற்று வலி": "stomach pain", "முதுகு வலி": "back pain",
        "சிறுநீர் எரிச்சல்": "burning urination", "பலவீனம்": "weakness",
        "சோர்வு": "fatigue", "தலைச்சுற்றல்": "dizziness", "படபடப்பு": "palpitations",
        "சளி": "cold", "மூக்கு ஒழுகுதல்": "runny nose", "தும்மல்": "sneezing",
        "தலைவலி": "headache", "தொண்டை வலி": "sore throat",
        "உடல் வலி": "body ache", "தசை வலி": "muscle pain",
        "அமிலத்தன்மை": "acidity", "வாயு": "gas", "மலச்சிக்கல்": "constipation",
        "தூக்கமின்மை": "insomnia", "மன அழுத்தம்": "stress", "லேசான காய்ச்சல்": "mild fever",
    },
}


# =============================================================================
# MEDICINE RECOMMENDATIONS
# =============================================================================

MEDICINE_RECOMMENDATIONS = {
    "Common Cold": [
        {"name": "Paracetamol (Crocin)", "dosage": "500mg every 6 hours", "type": "OTC"},
        {"name": "Cetirizine", "dosage": "10mg once daily", "type": "OTC"},
    ],
    "Viral Fever": [
        {"name": "Paracetamol", "dosage": "500-650mg every 4-6 hours", "type": "OTC"},
        {"name": "ORS (Oral Rehydration Salt)", "dosage": "After each loose stool", "type": "OTC"},
    ],
    "Tension Headache": [
        {"name": "Paracetamol", "dosage": "500mg as needed", "type": "OTC"},
        {"name": "Ibuprofen", "dosage": "400mg with food", "type": "OTC"},
    ],
    "Gastritis": [
        {"name": "Antacid (Gelusil/Digene)", "dosage": "10ml after meals", "type": "OTC"},
        {"name": "Pantoprazole", "dosage": "40mg before breakfast", "type": "Prescription"},
    ],
    "Acid Reflux": [
        {"name": "Antacid", "dosage": "After meals", "type": "OTC"},
        {"name": "Ranitidine", "dosage": "150mg twice daily", "type": "OTC"},
    ],
    "GERD": [
        {"name": "Omeprazole", "dosage": "20mg before breakfast", "type": "OTC"},
        {"name": "Antacid Gel", "dosage": "10ml after meals", "type": "OTC"},
    ],
    "Muscle Strain": [
        {"name": "Ibuprofen", "dosage": "400mg after food", "type": "OTC"},
        {"name": "Diclofenac Gel", "dosage": "Apply on affected area", "type": "OTC"},
    ],
    "UTI": [
        {"name": "Consult Doctor for Antibiotics", "dosage": "As prescribed", "type": "Prescription"},
        {"name": "Cranberry Juice", "dosage": "200ml twice daily", "type": "Home Remedy"},
    ],
    "Constipation": [
        {"name": "Isabgol (Psyllium Husk)", "dosage": "2 tsp with warm water at night", "type": "OTC"},
        {"name": "Lactulose", "dosage": "15ml at bedtime", "type": "OTC"},
    ],
    "Allergy": [
        {"name": "Cetirizine", "dosage": "10mg once daily", "type": "OTC"},
        {"name": "Calamine Lotion", "dosage": "Apply on rash", "type": "OTC"},
    ],
}


# =============================================================================
# PRECAUTIONS & RECOMMENDATIONS (by urgency level)
# =============================================================================

PRECAUTIONS = {
    "emergency": [
        "🚨 Call emergency services (108/102) immediately",
        "Do NOT wait - go to the nearest hospital NOW",
        "Keep the patient calm and still",
        "If unconscious, place in recovery position",
        "Bring all current medications to the hospital",
        "Note the time symptoms started"
    ],
    "visit-clinic": [
        "Visit a doctor within 24-48 hours",
        "Stay hydrated - drink plenty of water and ORS",
        "Take rest and avoid heavy physical activity",
        "Monitor your temperature regularly",
        "Take prescribed medications on time",
        "If symptoms worsen, go to hospital immediately",
        "Keep a record of your symptoms for the doctor"
    ],
    "self-care": [
        "Rest well and get 7-8 hours of sleep",
        "Drink warm fluids like soup and herbal tea",
        "Stay hydrated with water, ORS, or coconut water",
        "Eat light, nutritious home-cooked food",
        "Avoid oily, spicy, and outside food",
        "Monitor symptoms for 2-3 days",
        "If no improvement in 3 days, visit a clinic",
        "Wash hands frequently to prevent spreading"
    ]
}

RECOMMENDATIONS = {
    "emergency": [
        "Call ambulance (108/102) immediately",
        "Rush to nearest emergency hospital",
        "Do not eat or drink anything until seen by doctor",
        "Keep patient calm and lying down",
        "Bring list of current medications"
    ],
    "visit-clinic": [
        "Schedule a doctor visit within 24-48 hours",
        "Take rest and avoid strenuous activity",
        "Stay hydrated with ORS or water",
        "Take OTC medication if needed for symptom relief",
        "Keep track of symptoms including temperature",
        "Eat light, nutritious food"
    ],
    "self-care": [
        "Rest at home for 2-3 days",
        "Drink plenty of warm fluids",
        "Take paracetamol for fever/pain if needed",
        "Eat light home-cooked meals",
        "Avoid cold drinks and outside food",
        "Steam inhalation can help with cold symptoms",
        "Visit doctor if no improvement in 3 days"
    ]
}

DOCTOR_ADVICE = {
    "emergency": "🚨 GO TO THE NEAREST HOSPITAL IMMEDIATELY. Call 108/102 for ambulance. Do NOT delay!",
    "visit-clinic": "📋 Visit your nearest clinic or PHC within 24-48 hours. If symptoms worsen, go to hospital immediately.",
    "self-care": "🏠 You can manage this at home for now. If symptoms don't improve in 2-3 days, please visit a doctor."
}

DISCLAIMER = (
    "⚠️ DISCLAIMER: This is an AI-based preliminary assessment only. "
    "It is NOT a medical diagnosis. Always consult a qualified doctor. "
    "In case of emergency, call 108/102 immediately."
)


class TriageService:

    def _translate_to_english(self, text: str, language: str) -> str:
        """Translate symptoms to English for processing."""
        translation_map = SYMPTOM_TRANSLATIONS.get(language)
        if not translation_map:
            return text  # English or unsupported → return as-is

        translated = text
        # Sort by length (longer phrases first) to avoid partial replacements
        for native_word in sorted(translation_map.keys(), key=len, reverse=True):
            if native_word in translated:
                translated = translated.replace(native_word, translation_map[native_word])

        # Fallback to Groq LLM if no keyword matched and text has non-ASCII chars
        if translated == text and any(ord(c) > 127 for c in text):
            result = _call_llm(
                f"Translate this {language} medical symptom to English. Return ONLY the translation:\n{text}",
                temperature=0.1, timeout=15
            )
            if result:
                translated = result.strip()

        return translated

    def _extract_symptoms(self, text: str) -> list:
        """Extract known symptoms from text via keyword matching."""
        text_lower = text.lower()
        found = []

        # Match longer phrases first
        for symptom in sorted(SYMPTOM_DATABASE.keys(), key=len, reverse=True):
            if symptom in text_lower:
                found.append(symptom)

        # Fallback: match individual words
        if not found:
            for word in re.findall(r'\b\w+\b', text_lower):
                if word in SYMPTOM_DATABASE:
                    found.append(word)

        return list(set(found))

    def _calculate_urgency(self, symptoms: list) -> dict:
        """Rule-based urgency classification."""
        if not symptoms:
            return {"urgency_level": "self-care", "urgency_color": "green",
                    "confidence": 0.3, "conditions": ["General Wellness Check"], "score": 0}

        max_score = 0
        all_conditions = []
        urgency_levels = []

        for symptom in symptoms:
            if symptom in SYMPTOM_DATABASE:
                data = SYMPTOM_DATABASE[symptom]
                max_score = max(max_score, data["score"])
                all_conditions.extend(data["conditions"])
                urgency_levels.append(data["urgency"])

        # Determine urgency level
        if "emergency" in urgency_levels or max_score >= 8:
            urgency, color = "emergency", "red"
            confidence = min(0.95, 0.6 + max_score * 0.04)
        elif "visit-clinic" in urgency_levels or max_score >= 4:
            urgency, color = "visit-clinic", "yellow"
            confidence = min(0.9, 0.5 + max_score * 0.05)
        else:
            urgency, color = "self-care", "green"
            confidence = min(0.85, 0.4 + max_score * 0.1)

        # Escalate if 3+ self-care symptoms present
        if len(symptoms) >= 3 and urgency == "self-care":
            urgency, color = "visit-clinic", "yellow"
            confidence += 0.1

        return {
            "urgency_level": urgency, "urgency_color": color,
            "confidence": round(confidence, 2),
            "conditions": list(set(all_conditions))[:5], "score": max_score
        }

    def _get_medicine_info(self, conditions: list) -> list:
        """Get unique medicine recommendations for the detected conditions."""
        medicines, seen = [], set()
        for condition in conditions:
            for med in MEDICINE_RECOMMENDATIONS.get(condition, []):
                if med["name"] not in seen:
                    medicines.append(med)
                    seen.add(med["name"])

        if not medicines:
            medicines.append({"name": "Paracetamol (General)", "dosage": "500mg if needed for pain/fever", "type": "OTC"})
        return medicines

    async def process_symptoms(self, user_id: str, symptoms: str, language: str = "english",
                               input_type: str = "text", latitude: float = None, longitude: float = None) -> dict:
        """Main triage pipeline: translate → extract → classify → respond."""
        db = get_database()

        # Translate → Extract → Classify
        translated = self._translate_to_english(symptoms, language)
        extracted = self._extract_symptoms(translated)
        urgency = self._calculate_urgency(extracted)

        # Build response data
        medicines = self._get_medicine_info(urgency["conditions"])
        precautions = PRECAUTIONS.get(urgency["urgency_level"], PRECAUTIONS["self-care"])
        recommendations = RECOMMENDATIONS.get(urgency["urgency_level"], RECOMMENDATIONS["self-care"])
        when_to_see = DOCTOR_ADVICE.get(urgency["urgency_level"], DOCTOR_ADVICE["self-care"])

        # Find nearby hospitals
        nearby_hospitals = []
        if latitude and longitude:
            try:
                nearby_hospitals = await hospital_service.find_nearby(
                    latitude=latitude, longitude=longitude, radius_km=500.0,
                    emergency_only=(urgency["urgency_level"] == "emergency")
                )
            except Exception:
                pass

        # Save triage record
        record = {
            "user_id": user_id, "symptoms": symptoms, "translated_symptoms": translated,
            "input_type": input_type, "language": language,
            "urgency_level": urgency["urgency_level"], "urgency_color": urgency["urgency_color"],
            "confidence": urgency["confidence"], "extracted_symptoms": extracted,
            "possible_conditions": urgency["conditions"], "recommendations": recommendations,
            "precautions": precautions, "medicines_info": medicines,
            "when_to_see_doctor": when_to_see,
            "latitude": latitude, "longitude": longitude,
            "created_at": datetime.now()
        }
        await db.triage_records.insert_one(record)

        # Build response
        response = {
            "urgency_level": urgency["urgency_level"], "urgency_color": urgency["urgency_color"],
            "confidence": urgency["confidence"],
            "extracted_symptoms": extracted or ["general discomfort"],
            "possible_conditions": urgency["conditions"],
            "recommendations": recommendations, "precautions": precautions,
            "medicines_info": medicines, "when_to_see_doctor": when_to_see,
            "disclaimer": DISCLAIMER, "nearby_hospitals": nearby_hospitals[:5],
            "translated_response": None, "response_language": "english"
        }

        # Translate response if non-English
        if language and language != "english":
            try:
                response = translate_response_with_llm(response, language)
            except Exception as e:
                print(f"Translation step failed: {e}")

        return response

    async def get_user_history(self, user_id: str) -> list:
        """Get user's triage history (last 20 records)."""
        db = get_database()
        history = []
        async for record in db.triage_records.find({"user_id": user_id}).sort("created_at", -1).limit(20):
            record["id"] = str(record.pop("_id"))
            record["created_at"] = str(record.get("created_at", ""))
            history.append(record)
        return history

    async def get_triage_record(self, triage_id: str) -> dict:
        """Get a single triage record by ID."""
        db = get_database()
        record = await db.triage_records.find_one({"_id": ObjectId(triage_id)})
        if record:
            record["id"] = str(record.pop("_id"))
            record["created_at"] = str(record.get("created_at", ""))
            return record
        return None