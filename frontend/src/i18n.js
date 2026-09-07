import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "bookDoctor": "Book Doctor",
      "myMedicines": "My Medicines",
      "myProfile": "My Profile",
      "citizen": "Citizen",
      "language": "Language: EN / हिंदी",
      "welcomeBack": "Welcome back",
      "activeCitizenHealthRecord": "Active Citizen Health Record",
      "primaryCareServices": "Primary Care Services",
      "fastAccess": "Fast Access",
      "selectAnyServiceToBegin": "Select any service to begin",
      "bookTeleConsult": "Book Tele-Consult",
      "consultChc": "Consult CHC or District Specialist",
      "freeGovService": "Free Gov Service",
      "orderFreeMedicines": "Order Free Medicines",
      "janAushadhiRefill": "Jan Aushadhi Kendra refill",
      "subsidizedFree": "Subsidized / Free",
      "labTestsReports": "Lab Tests & Reports",
      "diagnosticHistoryVitals": "Diagnostic history & vitals",
      "instantSync": "Instant Sync",
      "findNearestPhc": "Find Nearest PHC",
      "dispensariesSubCentres": "Dispensaries & Sub-Centres",
      "yourUpcomingCare": "Your Upcoming Care",
      "next48Hours": "Next 48 Hours",
      "liveQueueMonitored": "Live Queue Monitored",
      "viewVitalsNotes": "View Vitals & Notes",
      "enterConsultation": "Enter Consultation",
      "villageHealthCamp": "Village Health Camp",
      "immunizationMaternalHealth": "Immunization & Maternal Health Checkup",
      "walkinFree": "Walk-in free for all mothers and infants",
      "villageAshaCompanion": "Village ASHA Companion",
      "activeToday": "Active Today",
      "govtCertified": "Govt Certified",
      "requestVisit": "Request Visit",
      "callAsha": "Call",
      "personalDetails": "Personal Details",
      "fullName": "Full Name",
      "abhaId": "ABHA ID (Health Card)",
      "mobileNumber": "Mobile Number",
      "linkedSubCentre": "Linked Sub-Centre",
      "editProfileInformation": "Edit Profile Information",
      "connectedDevicesSync": "Connected Devices & Sync",
      "noPortableDevices": "You have no portable medical devices synced to this account.",
      "connectBluetoothMonitor": "Connect Bluetooth Vitals Monitor",
      "logout": "Logout",
      "emergency": "Emergency 108"
    }
  },
  hi: {
    translation: {
      "dashboard": "डैशबोर्ड",
      "bookDoctor": "डॉक्टर बुक करें",
      "myMedicines": "मेरी दवाएं",
      "myProfile": "मेरी प्रोफ़ाइल",
      "citizen": "नागरिक",
      "language": "भाषा: हिंदी / EN",
      "welcomeBack": "वापसी पर स्वागत है",
      "activeCitizenHealthRecord": "सक्रिय नागरिक स्वास्थ्य रिकॉर्ड",
      "primaryCareServices": "प्राथमिक देखभाल सेवाएं",
      "fastAccess": "त्वरित पहुंच",
      "selectAnyServiceToBegin": "शुरू करने के लिए किसी भी सेवा का चयन करें",
      "bookTeleConsult": "टेली-परामर्श बुक करें",
      "consultChc": "CHC या जिला विशेषज्ञ से परामर्श लें",
      "freeGovService": "मुफ्त सरकारी सेवा",
      "orderFreeMedicines": "मुफ्त दवाएं ऑर्डर करें",
      "janAushadhiRefill": "जन औषधि केंद्र रिफिल",
      "subsidizedFree": "सब्सिडीकृत / मुफ्त",
      "labTestsReports": "लैब टेस्ट और रिपोर्ट",
      "diagnosticHistoryVitals": "नैदानिक इतिहास और विटल्स",
      "instantSync": "तत्काल सिंक",
      "findNearestPhc": "निकटतम PHC खोजें",
      "dispensariesSubCentres": "दवाखाने और उप-केंद्र",
      "yourUpcomingCare": "आपकी आगामी देखभाल",
      "next48Hours": "अगले 48 घंटे",
      "liveQueueMonitored": "लाइव कतार की निगरानी",
      "viewVitalsNotes": "विटल्स और नोट्स देखें",
      "enterConsultation": "परामर्श दर्ज करें",
      "villageHealthCamp": "ग्राम स्वास्थ्य शिविर",
      "immunizationMaternalHealth": "टीकाकरण और मातृ स्वास्थ्य जांच",
      "walkinFree": "सभी माताओं और शिशुओं के लिए मुफ्त वॉक-इन",
      "villageAshaCompanion": "ग्राम आशा साथी",
      "activeToday": "आज सक्रिय",
      "govtCertified": "सरकार द्वारा प्रमाणित",
      "requestVisit": "यात्रा का अनुरोध करें",
      "callAsha": "कॉल करें",
      "personalDetails": "व्यक्तिगत विवरण",
      "fullName": "पूरा नाम",
      "abhaId": "आभा आईडी (स्वास्थ्य कार्ड)",
      "mobileNumber": "मोबाइल नंबर",
      "linkedSubCentre": "जुड़ा हुआ उप-केंद्र",
      "editProfileInformation": "प्रोफ़ाइल जानकारी संपादित करें",
      "connectedDevicesSync": "जुड़े उपकरण और सिंक",
      "noPortableDevices": "इस खाते से कोई पोर्टेबल चिकित्सा उपकरण सिंक नहीं है।",
      "connectBluetoothMonitor": "ब्लूटूथ विटल्स मॉनिटर कनेक्ट करें",
      "logout": "लॉग आउट",
      "emergency": "आपातकालीन 108"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
