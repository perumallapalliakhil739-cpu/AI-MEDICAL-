export const dummyReports = {
  lipid: {
    id: 'lipid-001',
    title: 'Comprehensive Lipid & Cardiovascular Risk Panel',
    patientName: 'Rajesh Kumar, 48M',
    date: '18 Nov 2026',
    reportCategory: 'Cardiology / Biochemistry',
    fileName: 'DrLal_LipidProfile_Report_RK.pdf',
    fileSize: '1.8 MB',
    icmrWorkflow: 'ICMR STW 2024: Adult Dyslipidemia & Atherosclerotic Cardiovascular Disease (ASCVD) Risk Management',
    severity: 'Moderate to High Risk',
    severityColor: 'amber',
    analysis: {
      urgent_alert: null,
      main_findings: [
        {
          summary: "Your lipid report shows high LDL ('bad') cholesterol and elevated triglycerides, combined with lower HDL ('good') cholesterol. This pattern is commonly reviewed under the ICMR Adult Dyslipidemia guideline, as it may be associated with increased cardiovascular strain over time.",
          related_tests: ["Total Cholesterol", "LDL Cholesterol (Bad)", "Triglycerides", "HDL Cholesterol (Good)"],
          possible_condition: "Adult Dyslipidemia & Cardiovascular Risk Management",
          confidence_note: "Matched based on 3 primary atherogenic lipid markers exceeding ICMR thresholds.",
          source: {
            stw_id: "adult-dyslipidemia",
            source_file: "ICMR_STW_Adult_Dyslipidemia_ASCVD.pdf"
          }
        }
      ],
      precautions: [
        { text: "Reduce dietary intake of saturated fats (dalda, palm oil, deep-fried snacks) to <7% of daily calories.", source_stw_id: "adult-dyslipidemia" },
        { text: "Incorporate soluble dietary fiber (oats, isabgol, flaxseed, lentils) to naturally bind gastrointestinal cholesterol.", source_stw_id: "adult-dyslipidemia" },
        { text: "Engage in at least 150 minutes per week of moderate-intensity aerobic exercise (e.g., brisk walking).", source_stw_id: "adult-dyslipidemia" },
        { text: "Eliminate industrial trans-fats and avoid smoking/tobacco completely as it suppresses protective HDL.", source_stw_id: "adult-dyslipidemia" }
      ],
      medicines: [
        {
          name: "Atorvastatin",
          purpose: "First-line HMG-CoA Reductase Inhibitor for LDL cholesterol reduction",
          notes: "Usually taken once daily at bedtime. Baseline liver function tests and muscle symptom monitoring recommended.",
          source_stw_id: "adult-dyslipidemia"
        },
        {
          name: "Fenofibrate",
          purpose: "Triglyceride lowering agent (PPAR-alpha agonist)",
          notes: "Considered if triglycerides remain elevated after statin optimization. Must be taken with meals.",
          source_stw_id: "adult-dyslipidemia"
        },
        {
          name: "Ezetimibe",
          purpose: "Intestinal cholesterol absorption inhibitor (Adjunct)",
          notes: "Co-administered with statins when target LDL reduction is not achieved on maximum tolerated statin dose.",
          source_stw_id: "adult-dyslipidemia"
        }
      ],
      see_a_doctor_if: [
        "New-onset retrosternal chest tightness, heaviness, or pain radiating to the left arm or jaw",
        "Unexplained severe muscle soreness, persistent tenderness, or tea-colored urine",
        "Sudden acute shortness of breath during minimal routine activity"
      ],
      tests_without_match: []
    },
    abnormalValues: [
      {
        name: 'Total Cholesterol',
        value: 248,
        unit: 'mg/dL',
        reference: '< 200',
        status: 'High',
        level: 'warning',
        explanation: 'Elevated total circulating cholesterol, indicating excess circulating lipid volume in the bloodstream.'
      },
      {
        name: 'LDL Cholesterol (Bad)',
        value: 164,
        unit: 'mg/dL',
        reference: '< 100',
        status: 'High',
        level: 'danger',
        explanation: 'Primary atherogenic lipoprotein. High levels contribute directly to coronary artery narrowing.'
      },
      {
        name: 'Triglycerides',
        value: 240,
        unit: 'mg/dL',
        reference: '< 150',
        status: 'High',
        level: 'warning',
        explanation: 'Type of fat associated with metabolic syndrome, insulin resistance, and diets rich in refined sugars/oils.'
      },
      {
        name: 'HDL Cholesterol (Good)',
        value: 36,
        unit: 'mg/dL',
        reference: '> 40 (Male)',
        status: 'Low',
        level: 'warning',
        explanation: 'Protective lipid scavenger. Low values reduce the efficiency of reverse cholesterol transport to the liver.'
      },
      {
        name: 'VLDL Cholesterol',
        value: 48,
        unit: 'mg/dL',
        reference: '< 30',
        status: 'High',
        level: 'warning',
        explanation: 'Triglyceride-rich lipoprotein fraction contributing to microvascular stress.'
      },
      {
        name: 'Total Chol / HDL Ratio',
        value: 6.88,
        unit: 'Ratio',
        reference: '< 4.5',
        status: 'High',
        level: 'danger',
        explanation: 'Composite cardiac atherogenic index indicating elevated relative coronary risk.'
      }
    ]
  },

  cbc: {
    id: 'cbc-002',
    title: 'Complete Blood Count (CBC) & Anemia Screening',
    patientName: 'Ananya Sharma, 29F',
    date: '20 Nov 2026',
    reportCategory: 'Hematology',
    fileName: 'Thyrocare_CBC_Hemogram_AS.png',
    fileSize: '2.4 MB',
    icmrWorkflow: 'ICMR STW 2024: Diagnosis & Management of Nutritional Anemia in Reproductive Age Women',
    severity: 'Moderate Anemia',
    severityColor: 'amber',
    analysis: {
      urgent_alert: null,
      main_findings: [
        {
          summary: "Your blood test results show lower than normal hemoglobin, along with smaller and paler red blood cells (low MCV and low MCH). In ICMR guidelines, this pattern is frequently associated with nutritional iron deficiency anemia.",
          related_tests: ["Hemoglobin (Hb)", "RBC Count", "MCV", "MCH"],
          possible_condition: "Nutritional Anemia in Adults & Reproductive Age",
          confidence_note: "Microcytic hypochromic indices match ICMR diagnostic thresholds for nutritional iron depletion.",
          source: {
            stw_id: "nutritional-anemia",
            source_file: "ICMR_STW_Nutritional_Anemia_Adults.pdf"
          }
        }
      ],
      precautions: [
        { text: "Increase intake of dietary iron foods such as green leafy vegetables, jaggery, lentils, and sprouted pulses.", source_stw_id: "nutritional-anemia" },
        { text: "Pair iron-rich meals with Vitamin C sources (lemon, amla, oranges) to dramatically boost iron absorption.", source_stw_id: "nutritional-anemia" },
        { text: "Avoid drinking tea, coffee, or milk within 1 hour before or after main meals because tannins inhibit iron uptake.", source_stw_id: "nutritional-anemia" },
        { text: "Pace strenuous physical tasks and ensure adequate hydration to avoid rapid exertional fatigue.", source_stw_id: "nutritional-anemia" }
      ],
      medicines: [
        {
          name: "Ferrous Ascorbate / Ferrous Sulphate",
          purpose: "Primary therapeutic oral elemental iron replenishment",
          notes: "Typically taken on an empty stomach or between meals with citrus juice. Dark stools are a benign expected effect.",
          source_stw_id: "nutritional-anemia"
        },
        {
          name: "Folic Acid",
          purpose: "Cofactor for healthy red blood cell production",
          notes: "Co-prescribed alongside iron therapy per ICMR reproductive health protocol.",
          source_stw_id: "nutritional-anemia"
        },
        {
          name: "Albendazole",
          purpose: "Single-dose deworming protocol per ICMR guidelines",
          notes: "Single chewable dose at bedtime to eliminate parasitic blood loss prior to iron replenishment.",
          source_stw_id: "nutritional-anemia"
        }
      ],
      see_a_doctor_if: [
        "Feeling faint, lightheaded, or dizzy upon standing up",
        "Severe unexplained breathlessness on mild exertion or resting heart rate > 100 bpm",
        "Noticeably pale skin, inner eyelids, or extreme persistent exhaustion"
      ],
      tests_without_match: []
    },
    abnormalValues: [
      {
        name: 'Hemoglobin (Hb)',
        value: 9.2,
        unit: 'g/dL',
        reference: '12.0 - 15.5',
        status: 'Low',
        level: 'danger',
        explanation: 'Oxygen-carrying protein in red blood cells. Levels between 8.0-10.9 g/dL are classified as moderate anemia under ICMR criteria.'
      },
      {
        name: 'RBC Count',
        value: 3.65,
        unit: 'mill/cumm',
        reference: '3.80 - 4.80',
        status: 'Low',
        level: 'warning',
        explanation: 'Total circulating erythrocyte count is mildly depressed.'
      },
      {
        name: 'MCV',
        value: 71.2,
        unit: 'fL',
        reference: '80.0 - 100.0',
        status: 'Low',
        level: 'warning',
        explanation: 'Indicates microcytosis (abnormally small red blood cell size).'
      },
      {
        name: 'MCH',
        value: 22.4,
        unit: 'pg',
        reference: '27.0 - 32.0',
        status: 'Low',
        level: 'warning',
        explanation: 'Indicates hypochromia (diminished hemoglobin density within each RBC).'
      },
      {
        name: 'RDW-CV',
        value: 17.1,
        unit: '%',
        reference: '11.5 - 14.5',
        status: 'High',
        level: 'warning',
        explanation: 'Elevated anisocytosis, a key differentiator supporting iron deficiency over genetic thalassemia trait.'
      }
    ]
  },

  diabetes: {
    id: 'diabetes-003',
    title: 'Glycemic Evaluation & Metabolic Screening Panel',
    patientName: 'Sunil Varma, 52M',
    date: '22 Nov 2026',
    reportCategory: 'Endocrinology & Diabetology',
    fileName: 'Metropolis_HbA1c_Glucose_Report.pdf',
    fileSize: '1.2 MB',
    icmrWorkflow: 'ICMR STW 2024: Guidelines for Management of Type 2 Diabetes Mellitus in Primary Healthcare',
    severity: 'High Glycemic Burden',
    severityColor: 'rose',
    analysis: {
      urgent_alert: null,
      main_findings: [
        {
          summary: "Your report indicates elevated HbA1c and fasting blood sugar levels above standard biological targets. In ICMR workflows, this pattern indicates sustained blood sugar elevation over the past 90 days and warrants personalized physician care.",
          related_tests: ["HbA1c", "Fasting Blood Glucose", "Postprandial Glucose (2h PP)"],
          possible_condition: "Type 2 Diabetes Mellitus",
          confidence_note: "HbA1c >= 6.5% and Fasting Blood Glucose >= 126 mg/dL directly match ICMR criteria.",
          source: {
            stw_id: "diabetes-type-2",
            source_file: "ICMR_STW_Type_2_Diabetes_Mellitus.pdf"
          }
        }
      ],
      precautions: [
        { text: "Follow the ICMR plate method: 50% non-starchy vegetables, 25% lean protein, and 25% complex unrefined whole grains.", source_stw_id: "diabetes-type-2" },
        { text: "Strictly eliminate refined sugars, sweetened fruit beverages, bakery foods, and refined wheat products.", source_stw_id: "diabetes-type-2" },
        { text: "Aim for 150 minutes per week of brisk aerobic physical activity plus light resistance movements.", source_stw_id: "diabetes-type-2" },
        { text: "Inspect your feet daily for any minor blisters, cuts, or redness (diabetic foot prevention).", source_stw_id: "diabetes-type-2" }
      ],
      medicines: [
        {
          name: "Metformin Hydrochloride",
          purpose: "Foundational oral insulin sensitizer (Biguanide)",
          notes: "Taken with or immediately after meals to reduce stomach discomfort. Kidney function check recommended.",
          source_stw_id: "diabetes-type-2"
        },
        {
          name: "Teneligliptin",
          purpose: "DPP-4 Inhibitor for glucose control with minimal hypoglycemia risk",
          notes: "Taken once daily with or without food. Suitable across various renal function stages.",
          source_stw_id: "diabetes-type-2"
        },
        {
          name: "Dapagliflozin",
          purpose: "SGLT2 Inhibitor with cardiorenal protection",
          notes: "Promotes urinary glucose clearance. Ample daily water intake is essential.",
          source_stw_id: "diabetes-type-2"
        }
      ],
      see_a_doctor_if: [
        "Persistent nausea, vomiting, fruity breath odor, or extreme confusion (DKA alert)",
        "Symptoms of severe low blood sugar (shakiness, cold sweat, rapid heart rate, confusion)",
        "Sudden blurred vision, painful urination, or slow-healing foot sores"
      ],
      tests_without_match: []
    },
    abnormalValues: [
      {
        name: 'HbA1c',
        value: 8.8,
        unit: '%',
        reference: '< 5.7',
        status: 'High',
        level: 'danger',
        explanation: 'Three-month average blood glucose marker. Levels above 6.5% indicate diabetes.'
      },
      {
        name: 'Fasting Blood Glucose',
        value: 172,
        unit: 'mg/dL',
        reference: '70 - 99',
        status: 'High',
        level: 'danger',
        explanation: 'Baseline morning glucose output after 8 hours of fasting.'
      },
      {
        name: 'Postprandial Glucose (2h PP)',
        value: 238,
        unit: 'mg/dL',
        reference: '< 140',
        status: 'High',
        level: 'danger',
        explanation: 'Blood glucose spike 2 hours after a meal.'
      }
    ]
  }
};
