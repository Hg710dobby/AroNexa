import React from "react";
import { Link } from "react-router-dom";    

export default function RoleSelect() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-cyan-50 p-6">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-3xl">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🏥</div>
          <h1 className="text-3xl font-bold text-gray-800">Join AroNexa</h1>
          <p className="text-gray-500 mt-2">
            Choose how you want to register
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Patient */}
          <Link
            to="/register"
            className="border-2 border-green-200 rounded-2xl p-6 hover:border-green-600 hover:shadow-lg transition"
          >
            <div className="text-5xl mb-3">🧑</div>
            <h2 className="text-xl font-bold text-gray-800">
              Register as Patient
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Check symptoms, upload reports, find nearby hospitals and manage
              your health.
            </p>

            <div className="mt-5 bg-green-600 text-white rounded-xl py-3 text-center font-semibold">
              Create Patient Account
            </div>
          </Link>

          {/* ASHA */}
          <Link
            to="/asha-register"
            className="border-2 border-purple-200 rounded-2xl p-6 hover:border-purple-600 hover:shadow-lg transition"
          >
            <div className="text-5xl mb-3">👩‍⚕️</div>
            <h2 className="text-xl font-bold text-gray-800">
              Register as ASHA Worker
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Manage patient records, follow-up visits and community health
              analytics.
            </p>

            <div className="mt-5 bg-purple-600 text-white rounded-xl py-3 text-center font-semibold">
              Create ASHA Account
            </div>
          </Link>
        </div>

        <p className="text-center text-sm text-gray-500 mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}