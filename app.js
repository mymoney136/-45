import React, { useState, useEffect, createContext, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, collection, query, onSnapshot, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { FaUserCircle, FaBars, FaBell, FaCog, FaDollarSign, FaLanguage, FaPaintBrush, FaTimes, FaPlus, FaMinus, FaEdit, FaTrash, FaSave, FaSignOutAlt, FaGoogle, FaUserPlus, FaCalendarAlt, FaCalendarCheck } from 'react-icons/fa';
import { FaMoneyBillTrendUp } from 'react-icons/fa6';
import { useMediaQuery } from 'react-responsive';
import { Helmet } from 'react-helmet';

// Global variables from the canvas environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// Context for managing the app's state
const AppContext = createContext();

// A simple hook to use the context
const useAppContext = () => useContext(AppContext);

// Constants for translations, currencies, and fonts
const translations = {
    he: {
        'app_name': 'מנהל תקציב אישי',
        'dashboard': 'לוח מחוונים',
        'budget': 'תקציב',
        'history': 'היסטוריה',
        'settings': 'הגדרות',
        'sign_in': 'התחברות',
        'sign_up': 'הרשמה',
        'sign_in_with_google': 'התחבר עם גוגל',
        'continue_as_guest': 'המשך כאורח',
        'sign_out': 'התנתק',
        'email': 'אימייל',
        'password': 'סיסמה',
        'confirm_password': 'אימות סיסמה',
        'username': 'שם משתמש',
        'budget_period_start': 'תחילת תקופת התקציב',
        'budget_period_end': 'סוף תקופת התקציב',
        'daily_budget': 'תקציב יומי',
        'remaining_budget_today': 'נותר להיום',
        'total_budget': 'סך התקציב',
        'total_spent': 'סך ההוצאות',
        'total_income': 'סך ההכנסות',
        'add_transaction': 'הוסף פעולה',
        'transaction_type': 'סוג פעולה',
        'expense': 'הוצאה',
        'income': 'הכנסה',
        'amount': 'סכום',
        'description': 'תיאור',
        'add': 'הוסף',
        'display_settings': 'הגדרות תצוגה',
        'budget_settings': 'הגדרות תקציב',
        'language_settings': 'הגדרות שפה',
        'currency_settings': 'הגדרות מטבע',
        'theme': 'ערכת נושא',
        'light': 'בהיר',
        'dark': 'כהה',
        'transparent': 'שקוף',
        'background_image': 'תמונת רקע (URL)',
        'upload_image': 'העלה תמונה מהמחשב',
        'font_family': 'גופן טקסט',
        'save_changes': 'שמור שינויים',
        'settings_saved_successfully': 'הגדרות נשמרו בהצלחה',
        'enter_total_budget': 'הכנס סכום תקציב כולל',
        'auto_calculate_budget': 'חשב תקציב יומי אוטומטית',
        'days_in_period': 'מספר ימים בתקופה',
        'notifications': 'התראות',
        'enable_notifications': 'הפעל התראות',
        'test_notification': 'שלח התראת ניסיון',
        'no_notifications': 'אין התראות חדשות.',
        'pwa_instructions': 'כדי להפעיל התראות, הוסף את האתר למסך הבית שלך.',
        'notification_title_over': 'חריגה מהתקציב!',
        'notification_body_over': 'היום חרגת מהתקציב היומי שלך. נסה לחסוך יותר מחר.',
        'notification_title_under': 'כל הכבוד!',
        'notification_body_under': 'עמדת יפה בתקציב היומי שלך. המשך כך!',
        'notification_end_of_period': 'התקציב הסתיים!',
        'notification_end_of_period_over': 'נגמר הזמן לתקציב. פעם הבאה כדאי לנסות לחסוך קצת יותר.',
        'notification_end_of_period_under': 'נגמר הזמן לתקציב. כל הכבוד, עמדת ביעדים!',
        'view_all_notifications': 'צפה בכל ההתראות',
        'close': 'סגור',
        'tables': 'טבלאות',
        'savings_goals': 'יעדי חיסכון',
        'add_savings_goal': 'הוסף יעד חיסכון',
        'goal_name': 'שם היעד',
        'goal_amount': 'סכום היעד',
        'deadline': 'תאריך יעד',
        'daily_savings_needed': 'חיסכון יומי נדרש',
        'leftover_savings': 'השארת עודף בסוף התקופה',
        'amount_to_leave': 'סכום להשאיר',
        'currency_converter_link': 'קישור לממיר מטבעות חיצוני',
        'tips_settings': 'הגדרות טיפים',
        'enable_tips': 'הפעל טיפים',
        'all_rights_reserved': 'כל הזכויות שמורות',
        'login_tip': 'מומלץ להתחבר! כל הנתונים ישמרו בחשבונך ויהיה ניתן להשתמש בהם ממגוון מכשירים.',
        'background_tip': 'מומלץ לבקר בהגדרות התצוגה! תוכלו להוסיף תמונת רקע מאתרים כמו גוגל על ידי העתקת כתובת הקישור.',
        'budget_tip': 'טיפ לתקציב: כדי לחשב תקציב יומי מדויק, ודא שהכנסת את סכום הכסף הכולל ואת תאריכי התקופה.',
        'password_mismatch': 'הסיסמאות לא תואמות',
        'error_saving_settings': 'שגיאה בשמירת ההגדרות. נסה שוב.',
        'tables_and_reports': 'טבלאות ודוחות',
        'view_reports': 'צפה בדוחות',
        'transaction_history': 'היסטוריית פעולות',
        'date': 'תאריך',
        'amount_in': 'סכום ב-',
        'budget_report_daily': 'דוח יומי',
        'budget_report_weekly': 'דוח שבועי',
        'budget_report_monthly': 'דוח חודשי',
        'save_goal': 'שמור יעד',
        'current_saving_goals': 'יעדי חיסכון נוכחיים',
        'no_goals_yet': 'עדיין אין יעדי חיסכון.',
        'add_income_expense_error': 'שגיאה: יש להזין סכום ותיאור.',
        'cannot_add_transaction_guest': 'כאורח אינך יכול להוסיף פעולות. התחבר כדי לשמור את הנתונים שלך.',
        'change_currency_text': 'המטבע הראשי של האפליקציה השתנה. יש להזין את כל הסכומים מחדש במטבע החדש.',
        'daily_report_title': 'דוח יומי',
        'weekly_report_title': 'דוח שבועי',
        'monthly_report_title': 'דוח חודשי',
        'over_budget_message': 'חרגת מהתקציב היומי שלך ב-',
        'under_budget_message': 'חסכת מהתקציב היומי שלך ב-',
        'select_a_tip': 'בחר טיפ מהרשימה כדי לראות אותו.',
    },
    en: {
        'app_name': 'Personal Budget Manager',
        'dashboard': 'Dashboard',
        'budget': 'Budget',
        'history': 'History',
        'settings': 'Settings',
        'sign_in': 'Sign In',
        'sign_up': 'Sign Up',
        'sign_in_with_google': 'Sign in with Google',
        'continue_as_guest': 'Continue as Guest',
        'sign_out': 'Sign Out',
        'email': 'Email',
        'password': 'Password',
        'confirm_password': 'Confirm Password',
        'username': 'Username',
        'budget_period_start': 'Budget Period Start',
        'budget_period_end': 'Budget Period End',
        'daily_budget': 'Daily Budget',
        'remaining_budget_today': 'Remaining for Today',
        'total_budget': 'Total Budget',
        'total_spent': 'Total Spent',
        'total_income': 'Total Income',
        'add_transaction': 'Add Transaction',
        'transaction_type': 'Transaction Type',
        'expense': 'Expense',
        'income': 'Income',
        'amount': 'Amount',
        'description': 'Description',
        'add': 'Add',
        'display_settings': 'Display Settings',
        'budget_settings': 'Budget Settings',
        'language_settings': 'Language Settings',
        'currency_settings': 'Currency Settings',
        'theme': 'Theme',
        'light': 'Light',
        'dark': 'Dark',
        'transparent': 'Transparent',
        'background_image': 'Background Image (URL)',
        'upload_image': 'Upload an image from your computer',
        'font_family': 'Text Font',
        'save_changes': 'Save Changes',
        'settings_saved_successfully': 'Settings saved successfully',
        'enter_total_budget': 'Enter Total Budget Amount',
        'auto_calculate_budget': 'Auto-calculate Daily Budget',
        'days_in_period': 'Days in period',
        'notifications': 'Notifications',
        'enable_notifications': 'Enable Notifications',
        'test_notification': 'Send a test notification',
        'no_notifications': 'No new notifications.',
        'pwa_instructions': 'To enable notifications, add the app to your home screen.',
        'notification_title_over': 'Budget Exceeded!',
        'notification_body_over': 'You have exceeded your daily budget. Try to save more tomorrow.',
        'notification_title_under': 'Great Job!',
        'notification_body_under': 'You stayed within your daily budget. Keep it up!',
        'notification_end_of_period': 'Budget Period Ended!',
        'notification_end_of_period_over': 'Time\'s up for this budget. Try to save a bit more next time.',
        'notification_end_of_period_under': 'Time\'s up for this budget. Great job, you met your goals!',
        'view_all_notifications': 'View All Notifications',
        'close': 'Close',
        'tables': 'Tables',
        'savings_goals': 'Savings Goals',
        'add_savings_goal': 'Add Savings Goal',
        'goal_name': 'Goal Name',
        'goal_amount': 'Goal Amount',
        'deadline': 'Deadline',
        'daily_savings_needed': 'Daily Savings Needed',
        'leftover_savings': 'Leave leftover savings at end of period',
        'amount_to_leave': 'Amount to leave',
        'currency_converter_link': 'External Currency Converter Link',
        'tips_settings': 'Tips Settings',
        'enable_tips': 'Enable Tips',
        'all_rights_reserved': 'All Rights Reserved',
        'login_tip': 'It is recommended to sign in! All your data will be saved to your account and accessible from various devices.',
        'background_tip': 'It is recommended to visit Display Settings! You can add a background image from sites like Google by copying its URL.',
        'budget_tip': 'Budget Tip: To calculate an accurate daily budget, make sure you enter the total budget amount and the period dates.',
        'password_mismatch': 'Passwords do not match',
        'error_saving_settings': 'Error saving settings. Please try again.',
        'tables_and_reports': 'Tables and Reports',
        'view_reports': 'View Reports',
        'transaction_history': 'Transaction History',
        'date': 'Date',
        'amount_in': 'Amount in',
        'budget_report_daily': 'Daily Report',
        'budget_report_weekly': 'Weekly Report',
        'budget_report_monthly': 'Monthly Report',
        'save_goal': 'Save Goal',
        'current_saving_goals': 'Current Saving Goals',
        'no_goals_yet': 'No saving goals yet.',
        'add_income_expense_error': 'Error: Amount and description are required.',
        'cannot_add_transaction_guest': 'As a guest, you cannot add transactions. Sign in to save your data.',
        'change_currency_text': 'The main currency has been changed. All amounts should be re-entered in the new currency.',
        'daily_report_title': 'Daily Report',
        'weekly_report_title': 'Weekly Report',
        'monthly_report_title': 'Monthly Report',
        'over_budget_message': 'You have exceeded your daily budget by',
        'under_budget_message': 'You saved on your daily budget by',
        'select_a_tip': 'Select a tip from the list to see it.',
    },
};

const currencies = {
    'USD': 'US Dollar',
    'EUR': 'Euro',
    'JPY': 'Japanese Yen',
    'GBP': 'British Pound Sterling',
    'AUD': 'Australian Dollar',
    'CAD': 'Canadian Dollar',
    'CHF': 'Swiss Franc',
    'CNY': 'Chinese Yuan',
    'SEK': 'Swedish Krona',
    'NZD': 'New Zealand Dollar',
    'MXN': 'Mexican Peso',
    'SGD': 'Singapore Dollar',
    'HKD': 'Hong Kong Dollar',
    'NOK': 'Norwegian Krone',
    'KRW': 'South Korean Won',
    'TRY': 'Turkish Lira',
    'RUB': 'Russian Ruble',
    'INR': 'Indian Rupee',
    'BRL': 'Brazilian Real',
    'ZAR': 'South African Rand',
    'ILS': 'Israeli Shekel',
    'PLN': 'Polish Złoty',
    'CZK': 'Czech Koruna',
    'HUF': 'Hungarian Forint',
    'EGP': 'Egyptian Pound',
    'AED': 'UAE Dirham',
    'SAR': 'Saudi Riyal',
    'QAR': 'Qatari Riyal',
    'KWD': 'Kuwaiti Dinar',
    'BHD': 'Bahraini Dinar',
    'OMR': 'Omani Rial',
    'JOD': 'Jordanian Dinar',
    'LBP': 'Lebanese Pound',
    'PKR': 'Pakistani Rupee',
    'IDR': 'Indonesian Rupiah',
    'PHP': 'Philippine Peso',
    'THB': 'Thai Baht',
    'VND': 'Vietnamese Dong',
    'MYR': 'Malaysian Ringgit',
    'RON': 'Romanian Leu',
    'CLP': 'Chilean Peso',
    'COP': 'Colombian Peso',
    'DOP': 'Dominican Peso',
    'GTQ': 'Guatemalan Quetzal',
    'HNL': 'Honduran Lempira',
    'CRC': 'Costa Rican Colon',
    'PAB': 'Panamanian Balboa',
    'PEN': 'Peruvian Sol',
    'UYU': 'Uruguayan Peso',
    'VEF': 'Venezuelan Bolívar',
    'GHS': 'Ghanaian Cedi',
    'KES': 'Kenyan Shilling',
    'NGN': 'Nigerian Naira',
    'XOF': 'CFA Franc BCEAO',
    'XAF': 'CFA Franc BEAC',
    'ZMW': 'Zambian Kwacha',
    'MAD': 'Moroccan Dirham',
    'DZD': 'Algerian Dinar',
    'TND': 'Tunisian Dinar',
    'IQD': 'Iraqi Dinar',
    'IRR': 'Iranian Rial',
    'LKR': 'Sri Lankan Rupee',
    'BDT': 'Bangladeshi Taka',
    'NPR': 'Nepalese Rupee',
    'MVR': 'Maldivian Rufiyaa',
    'LAK': 'Lao Kip',
    'MMK': 'Burmese Kyat',
    'KHR': 'Cambodian Riel',
    'BND': 'Brunei Dollar',
    'FJD': 'Fijian Dollar',
    'PGK': 'Papua New Guinean Kina',
    'SBD': 'Solomon Islands Dollar',
    'VUV': 'Vanuatu Vatu',
    'WST': 'Samoan Tala',
};

const fonts = ['Inter', 'Arial', 'Verdana', 'Tahoma', 'Georgia', 'Times New Roman'];

const AppProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [settings, setSettings] = useState({
        language: 'he',
        currency: 'ILS',
        theme: 'light',
        transparent: false,
        backgroundImage: '',
        fontFamily: 'Inter',
        budgetAmount: 0,
        budgetPeriodStart: new Date().toISOString().substring(0, 10),
        budgetPeriodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().substring(0, 10),
        autoCalculateBudget: true,
        leftoverSavingsEnabled: false,
        leftoverSavingsAmount: 0,
        notificationsEnabled: false,
        tipsEnabled: true,
        activeTips: ['login_tip', 'background_tip', 'budget_tip'],
        pwaInstructionsDismissed: false,
    });
    const [transactions, setTransactions] = useState([]);
    const [savingsGoals, setSavingsGoals] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [showNotificationsModal, setShowNotificationsModal] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [isPWA, setIsPWA] = useState(false);

    useEffect(() => {
        // PWA detection
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        setIsPWA(isStandalone);
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setUserId(currentUser.uid);
                // Load user data from Firestore
                const userDocRef = doc(db, 'artifacts', appId, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    setSettings((prevSettings) => ({
                        ...prevSettings,
                        ...userDocSnap.data().settings,
                    }));
                }
            } else {
                setUser(null);
                setUserId(null);
            }
            setIsAuthReady(true);
        });

        // Sign in anonymously or with custom token on initial load
        const handleAuth = async () => {
            try {
                if (initialAuthToken) {
                    await signInWithCustomToken(auth, initialAuthToken);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Error during initial authentication:", error);
            }
        };

        handleAuth();

        return () => unsubscribe();
    }, []);

    // Firestore listeners for data
    useEffect(() => {
        if (userId) {
            // Settings listener
            const settingsDocRef = doc(db, 'artifacts', appId, 'users', userId, 'data', 'settings');
            const unsubscribeSettings = onSnapshot(settingsDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setSettings((prevSettings) => ({ ...prevSettings, ...data }));
                }
            });

            // Transactions listener
            const transactionsColRef = collection(db, 'artifacts', appId, 'users', userId, 'transactions');
            const unsubscribeTransactions = onSnapshot(transactionsColRef, (querySnapshot) => {
                const fetchedTransactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setTransactions(fetchedTransactions);
            });

            // Savings goals listener
            const goalsColRef = collection(db, 'artifacts', appId, 'users', userId, 'savingsGoals');
            const unsubscribeGoals = onSnapshot(goalsColRef, (querySnapshot) => {
                const fetchedGoals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setSavingsGoals(fetchedGoals);
            });
            
            // Notifications listener
            const notificationsColRef = collection(db, 'artifacts', appId, 'users', userId, 'notifications');
            const unsubscribeNotifications = onSnapshot(notificationsColRef, (querySnapshot) => {
                const fetchedNotifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                fetchedNotifications.sort((a,b) => b.timestamp - a.timestamp);
                setNotifications(fetchedNotifications);
            });

            return () => {
                unsubscribeSettings();
                unsubscribeTransactions();
                unsubscribeGoals();
                unsubscribeNotifications();
            };
        }
    }, [userId]);


    const saveSettings = async (newSettings) => {
        if (!userId) {
            setToastMessage(translations[settings.language]['error_saving_settings']);
            setShowToast(true);
            return;
        }
        try {
            const settingsDocRef = doc(db, 'artifacts', appId, 'users', userId, 'data', 'settings');
            await setDoc(settingsDocRef, newSettings, { merge: true });
            setSettings(newSettings);
            setToastMessage(translations[settings.language]['settings_saved_successfully']);
            setShowToast(true);
        } catch (e) {
            console.error("Error saving settings: ", e);
            setToastMessage(translations[settings.language]['error_saving_settings']);
            setShowToast(true);
        }
    };

    const addTransaction = async (transaction) => {
        if (!userId || user.isAnonymous) {
            setToastMessage(translations[settings.language]['cannot_add_transaction_guest']);
            setShowToast(true);
            return;
        }
        if (!transaction.amount || !transaction.description) {
            setToastMessage(translations[settings.language]['add_income_expense_error']);
            setShowToast(true);
            return;
        }
        try {
            const transactionsColRef = collection(db, 'artifacts', appId, 'users', userId, 'transactions');
            await addDoc(transactionsColRef, {
                ...transaction,
                timestamp: Date.now(),
                amount: parseFloat(transaction.amount),
                currency: settings.currency,
                date: new Date(transaction.date).toISOString().substring(0, 10),
            });
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };
    
    const addNotification = async (notification) => {
        if (!userId || user.isAnonymous) return;
        try {
            const notificationsColRef = collection(db, 'artifacts', appId, 'users', userId, 'notifications');
            await addDoc(notificationsColRef, {
                ...notification,
                timestamp: Date.now(),
            });
        } catch (e) {
            console.error("Error adding notification: ", e);
        }
    };

    const removeNotification = async (id) => {
        if (!userId || user.isAnonymous) return;
        try {
            const docRef = doc(db, 'artifacts', appId, 'users', userId, 'notifications', id);
            await deleteDoc(docRef);
        } catch (e) {
            console.error("Error deleting notification: ", e);
        }
    };
    
    const addSavingGoal = async (goal) => {
        if (!userId || user.isAnonymous) {
            setToastMessage(translations[settings.language]['cannot_add_transaction_guest']);
            setShowToast(true);
            return;
        }
        if (!goal.name || !goal.amount || !goal.deadline) {
            setToastMessage('יש למלא את כל השדות');
            setShowToast(true);
            return;
        }
        try {
            const goalsColRef = collection(db, 'artifacts', appId, 'users', userId, 'savingsGoals');
            await addDoc(goalsColRef, {
                ...goal,
                amount: parseFloat(goal.amount),
                currency: settings.currency,
                deadline: new Date(goal.deadline).toISOString().substring(0, 10),
                createdAt: Date.now(),
            });
        } catch (e) {
            console.error("Error adding savings goal: ", e);
        }
    };

    const deleteSavingGoal = async (id) => {
        if (!userId || user.isAnonymous) return;
        try {
            const docRef = doc(db, 'artifacts', appId, 'users', userId, 'savingsGoals', id);
            await deleteDoc(docRef);
        } catch (e) {
            console.error("Error deleting savings goal: ", e);
        }
    };

    const contextValue = {
        user,
        userId,
        isAuthReady,
        currentPage,
        setCurrentPage,
        settings,
        setSettings,
        saveSettings,
        transactions,
        addTransaction,
        savingsGoals,
        addSavingGoal,
        deleteSavingGoal,
        notifications,
        addNotification,
        removeNotification,
        showLoginModal,
        setShowLoginModal,
        showSettingsModal,
        setShowSettingsModal,
        showNotificationsModal,
        setShowNotificationsModal,
        showToast,
        setShowToast,
        toastMessage,
        setToastMessage,
        isPWA,
    };

    return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

const Header = () => {
    const { user, currentPage, setCurrentPage, showSettingsModal, setShowSettingsModal, showNotificationsModal, setShowNotificationsModal, showLoginModal, setShowLoginModal, settings, saveSettings, isPWA, addNotification } = useAppContext();
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            setShowLoginModal(false);
            setCurrentPage('dashboard');
            // Revert to guest settings on sign out
            saveSettings({
                language: 'he',
                currency: 'ILS',
                theme: 'light',
                transparent: false,
                backgroundImage: '',
                fontFamily: 'Inter',
                budgetAmount: 0,
                budgetPeriodStart: new Date().toISOString().substring(0, 10),
                budgetPeriodEnd: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().substring(0, 10),
                autoCalculateBudget: true,
                leftoverSavingsEnabled: false,
                leftoverSavingsAmount: 0,
                notificationsEnabled: false,
                tipsEnabled: true,
                activeTips: ['login_tip', 'background_tip', 'budget_tip'],
            });
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const handleTestNotification = async () => {
        if (Notification.permission === 'granted') {
            new Notification(translations[settings.language]['notification_title_under'], {
                body: translations[settings.language]['notification_body_under'],
            });
        }
    };

    return (
        <header className={`p-4 shadow-lg text-white ${settings.theme === 'dark' ? 'bg-gray-800 bg-opacity-70' : 'bg-white bg-opacity-70'} ${settings.transparent ? 'backdrop-blur-md' : ''}`}>
            <nav className="container mx-auto flex items-center justify-between">
                <div className={`flex items-center space-x-4 ${settings.language === 'he' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <h1 className="text-2xl font-bold font-['Inter']" style={{ fontFamily: settings.fontFamily }}>
                        {translations[settings.language]['app_name']}
                    </h1>
                </div>
                <div className={`flex items-center gap-4 text-xl ${settings.language === 'he' ? 'flex-row-reverse' : ''}`}>
                    <div className="relative">
                        <button
                            onClick={() => setShowNotificationsModal(true)}
                            className={`p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 ${settings.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                            aria-label="Notifications"
                        >
                            <FaBell />
                        </button>
                    </div>
                    <button
                        onClick={() => setShowSettingsModal(true)}
                        className={`p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 ${settings.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                        aria-label="Settings"
                    >
                        <FaCog />
                    </button>
                    {!user || user.isAnonymous ? (
                        <div className="relative group">
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className={`p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 ${settings.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                                aria-label="Account"
                            >
                                <FaUserCircle />
                            </button>
                        </div>
                    ) : (
                        <div className="relative group">
                             <button
                                onClick={handleSignOut}
                                className={`p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 ${settings.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                                aria-label="Sign Out"
                            >
                                <FaSignOutAlt />
                            </button>
                        </div>
                    )}
                    <div className="relative">
                        <button
                            onClick={() => {
                                const newLanguage = settings.language === 'he' ? 'en' : 'he';
                                saveSettings({ ...settings, language: newLanguage });
                            }}
                            className={`p-2 rounded-full hover:bg-gray-700 transition-colors duration-200 ${settings.theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
                            aria-label="Change Language"
                        >
                            <FaLanguage />
                        </button>
                    </div>
                </div>
            </nav>
            <div className={`flex justify-center mt-4 text-sm font-semibold gap-4 ${settings.language === 'he' ? 'flex-row-reverse' : ''}`}>
                <button
                    onClick={() => setCurrentPage('dashboard')}
                    className={`pb-1 border-b-2 transition-colors duration-200 ${
                        currentPage === 'dashboard' ? 'border-indigo-500 text-indigo-500' : 'border-transparent hover:border-gray-400'
                    }`}
                >
                    {translations[settings.language]['dashboard']}
                </button>
                <button
                    onClick={() => setCurrentPage('tables')}
                    className={`pb-1 border-b-2 transition-colors duration-200 ${
                        currentPage === 'tables' ? 'border-indigo-500 text-indigo-500' : 'border-transparent hover:border-gray-400'
                    }`}
                >
                    {translations[settings.language]['tables']}
                </button>
                <button
                    onClick={() => setCurrentPage('savings')}
                    className={`pb-1 border-b-2 transition-colors duration-200 ${
                        currentPage === 'savings' ? 'border-indigo-500 text-indigo-500' : 'border-transparent hover:border-gray-400'
                    }`}
                >
                    {translations[settings.language]['savings_goals']}
                </button>
            </div>
        </header>
    );
};

const Modal = ({ title, children, isOpen, onClose }) => {
    if (!isOpen) return null;

    const { settings } = useAppContext();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ fontFamily: settings.fontFamily }}>
            <div className={`relative w-11/12 md:w-3/4 lg:w-1/2 p-6 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh] ${settings.transparent ? 'backdrop-blur-xl bg-opacity-40' : 'bg-opacity-90'} ${settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
                <button onClick={onClose} className="absolute top-4 right-4 text-xl">
                    <FaTimes />
                </button>
                <h2 className="text-3xl font-bold mb-4">{title}</h2>
                {children}
            </div>
        </div>
    );
};

const Toast = ({ message, show, onClose }) => {
    const { settings } = useAppContext();
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 25000); // 25 seconds for the tip to disappear
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div dir={settings.language === 'he' ? 'rtl' : 'ltr'} className={`fixed top-4 z-50 p-4 rounded-xl shadow-lg transition-all duration-300 transform ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} ${settings.language === 'he' ? 'left-4' : 'right-4'}`} style={{ fontFamily: settings.fontFamily }}>
            {message}
        </div>
    );
};

const LoginModal = () => {
    const { setShowLoginModal, settings, setCurrentPage, setToastMessage, setShowToast } = useAppContext();
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');

    const handleSignIn = async () => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setShowLoginModal(false);
            setCurrentPage('dashboard');
        } catch (error) {
            console.error("Sign-in error:", error);
            setToastMessage('שגיאה בהתחברות: ' + error.message);
            setShowToast(true);
        }
    };

    const handleSignUp = async () => {
        if (password !== confirmPassword) {
            setToastMessage(translations[settings.language]['password_mismatch']);
            setShowToast(true);
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'settings'), {
                ...settings,
                username: username,
            });
            setShowLoginModal(false);
            setCurrentPage('dashboard');
        } catch (error) {
            console.error("Sign-up error:", error);
            setToastMessage('שגיאת הרשמה: ' + error.message);
            setShowToast(true);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithPopup(auth, provider);
            setShowLoginModal(false);
            setCurrentPage('dashboard');
        } catch (error) {
            console.error("Google sign-in error:", error);
            setToastMessage('שגיאה בהתחברות עם גוגל: ' + error.message);
            setShowToast(true);
        }
    };

    const handleGuestSignIn = async () => {
        try {
            await signInAnonymously(auth);
            setShowLoginModal(false);
            setCurrentPage('dashboard');
        } catch (error) {
            console.error("Guest sign-in error:", error);
            setToastMessage('שגיאה בהתחברות כאורח: ' + error.message);
            setShowToast(true);
        }
    };

    return (
        <Modal title={isSignUp ? translations[settings.language]['sign_up'] : translations[settings.language]['sign_in']} isOpen={true} onClose={() => setShowLoginModal(false)}>
            <div className="flex flex-col gap-4">
                {isSignUp && (
                    <input
                        type="text"
                        placeholder={translations[settings.language]['username']}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`p-3 rounded-xl border border-gray-300 ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
                    />
                )}
                <input
                    type="email"
                    placeholder={translations[settings.language]['email']}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`p-3 rounded-xl border border-gray-300 ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
                />
                <input
                    type="password"
                    placeholder={translations[settings.language]['password']}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`p-3 rounded-xl border border-gray-300 ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
                />
                {isSignUp && (
                    <input
                        type="password"
                        placeholder={translations[settings.language]['confirm_password']}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`p-3 rounded-xl border border-gray-300 ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
                    />
                )}
                <button
                    onClick={isSignUp ? handleSignUp : handleSignIn}
                    className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors duration-200"
                >
                    {isSignUp ? translations[settings.language]['sign_up'] : translations[settings.language]['sign_in']}
                </button>
                <div className="flex items-center my-4">
                    <hr className="flex-grow border-gray-300" />
                    <span className="mx-4 text-gray-500">or</span>
                    <hr className="flex-grow border-gray-300" />
                </div>
                <button
                    onClick={handleGoogleSignIn}
                    className="p-3 flex items-center justify-center gap-2 bg-red-600 text-white rounded-xl shadow-lg hover:bg-red-700 transition-colors duration-200"
                >
                    <FaGoogle /> {translations[settings.language]['sign_in_with_google']}
                </button>
                <button
                    onClick={handleGuestSignIn}
                    className="p-3 bg-gray-600 text-white rounded-xl shadow-lg hover:bg-gray-700 transition-colors duration-200"
                >
                    {translations[settings.language]['continue_as_guest']}
                </button>
                <button onClick={() => setIsSignUp(!isSignUp)} className="mt-4 text-sm text-indigo-500 hover:underline">
                    {isSignUp ? translations[settings.language]['sign_in'] : translations[settings.language]['sign_up']}
                </button>
            </div>
        </Modal>
    );
};

const SettingsModal = () => {
    const { setShowSettingsModal, settings, saveSettings, isPWA, addNotification, setToastMessage, setShowToast } = useAppContext();
    const [tempSettings, setTempSettings] = useState(settings);
    const [activeTab, setActiveTab] = useState('display');
    const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

    const handleSave = () => {
        saveSettings(tempSettings);
        setShowSettingsModal(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                setTempSettings(prev => ({ ...prev, backgroundImage: imageUrl }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNotificationPermission = async () => {
        if (isPWA) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setTempSettings(prev => ({ ...prev, notificationsEnabled: true }));
                handleTestNotification();
            } else {
                setTempSettings(prev => ({ ...prev, notificationsEnabled: false }));
            }
        }
    };
    
    const handleTestNotification = () => {
        if (tempSettings.notificationsEnabled) {
            new Notification(translations[settings.language]['notification_title_under'], {
                body: translations[settings.language]['notification_body_under'],
            });
        }
    };
    
    const handleAddCurrencyLink = () => {
         window.open('https://www.xe.com/currencyconverter/', '_blank');
    };

    return (
        <Modal title={translations[settings.language]['settings']} isOpen={true} onClose={() => setShowSettingsModal(false)}>
            <div dir={settings.language === 'he' ? 'rtl' : 'ltr'} className={`flex ${isMobile ? 'flex-col' : ''}`}>
                <div className={`p-4 border-b md:border-b-0 ${settings.theme === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}>
                    <ul className="space-y-2">
                        <li>
                            <button
                                onClick={() => setActiveTab('display')}
                                className={`w-full text-left p-2 rounded-lg transition-colors duration-200 ${activeTab === 'display' ? 'bg-indigo-500 text-white' : (settings.theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}
                            >
                                {translations[settings.language]['display_settings']}
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setActiveTab('budget')}
                                className={`w-full text-left p-2 rounded-lg transition-colors duration-200 ${activeTab === 'budget' ? 'bg-indigo-500 text-white' : (settings.theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}
                            >
                                {translations[settings.language]['budget_settings']}
                            </button>
                        </li>
                         <li>
                            <button
                                onClick={() => setActiveTab('tips')}
                                className={`w-full text-left p-2 rounded-lg transition-colors duration-200 ${activeTab === 'tips' ? 'bg-indigo-500 text-white' : (settings.theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100')}`}
                            >
                                {translations[settings.language]['tips_settings']}
                            </button>
                        </li>
                    </ul>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                    {activeTab === 'display' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold mb-2">{translations[settings.language]['theme']}</label>
                                <div className="flex items-center space-x-4">
                                    <label>
                                        <input
                                            type="radio"
                                            name="theme"
                                            value="light"
                                            checked={tempSettings.theme === 'light'}
                                            onChange={() => setTempSettings(prev => ({ ...prev, theme: 'light' }))}
                                            className="mr-2"
                                        />
                                        {translations[settings.language]['light']}
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="theme"
                                            value="dark"
                                            checked={tempSettings.theme === 'dark'}
                                            onChange={() => setTempSettings(prev => ({ ...prev, theme: 'dark' }))}
                                            className="mr-2"
                                        />
                                        {translations[settings.language]['dark']}
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="block font-bold mb-2">{translations[settings.language]['transparent']}</label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={tempSettings.transparent}
                                        onChange={() => setTempSettings(prev => ({ ...prev, transparent: !prev.transparent }))}
                                        className="mr-2"
                                    />
                                    {translations[settings.language]['transparent']}
                                </label>
                            </div>
                            <div>
                                <label className="block font-bold mb-2">{translations[settings.language]['background_image']}</label>
                                <input
                                    type="text"
                                    placeholder="Enter image URL"
                                    value={tempSettings.backgroundImage}
                                    onChange={(e) => setTempSettings(prev => ({ ...prev, backgroundImage: e.target.value }))}
                                    className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
                                />
                                <label className="block mt-2">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="file-upload"/>
                                    <label htmlFor="file-upload" className="cursor-pointer text-indigo-500 hover:underline">
                                        {translations[settings.language]['upload_image']}
                                    </label>
                                </label>
                            </div>
                            <div>
                                <label className="block font-bold mb-2">{translations[settings.language]['font_family']}</label>
                                <select
                                    value={tempSettings.fontFamily}
                                    onChange={(e) => setTempSettings(prev => ({ ...prev, fontFamily: e.target.value }))}
                                    className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
                                >
                                    {fonts.map(font => (
                                        <option key={font} value={font}>
                                            {font}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block font-bold mb-2">{translations[settings.language]['currency_settings']}</label>
                                <select
                                    value={tempSettings.currency}
                                    onChange={(e) => {
                                        setTempSettings(prev => ({ ...prev, currency: e.target.value }));
                                        setToastMessage(translations[settings.language]['change_currency_text']);
                                        setShowToast(true);
                                    }}
                                    className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
                                >
                                    {Object.entries(currencies).map(([code, name]) => (
                                        <option key={code} value={code}>
                                            {`${code} - ${name}`}
                                        </option>
                                    ))}
                                </select>
                                <button onClick={handleAddCurrencyLink} className="mt-2 text-indigo-500 hover:underline">
                                    {translations[settings.language]['currency_converter_link']}
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'budget' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold mb-2">{translations[settings.language]['budget_period_start']}</label>
                                <input
                                    type="date"
                                    value={tempSettings.budgetPeriodStart}
                                    onChange={(e) => setTempSettings(prev => ({ ...prev, budgetPeriodStart: e.target.value }))}
                                    className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2">{translations[settings.language]['budget_period_end']}</label>
                                <input
                                    type="date"
                                    value={tempSettings.budgetPeriodEnd}
                                    onChange={(e) => setTempSettings(prev => ({ ...prev, budgetPeriodEnd: e.target.value }))}
                                    className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2">{translations[settings.language]['total_budget']}</label>
                                <input
                                    type="number"
                                    value={tempSettings.budgetAmount}
                                    onChange={(e) => setTempSettings(prev => ({ ...prev, budgetAmount: parseFloat(e.target.value) }))}
                                    className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
                                />
                            </div>
                            <div>
                                <label className="block font-bold mb-2">{translations[settings.language]['leftover_savings']}</label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={tempSettings.leftoverSavingsEnabled}
                                        onChange={() => setTempSettings(prev => ({ ...prev, leftoverSavingsEnabled: !prev.leftoverSavingsEnabled }))}
                                        className="mr-2"
                                    />
                                    {translations[settings.language]['leftover_savings']}
                                </label>
                                {tempSettings.leftoverSavingsEnabled && (
                                    <input
                                        type="number"
                                        placeholder={translations[settings.language]['amount_to_leave']}
                                        value={tempSettings.leftoverSavingsAmount}
                                        onChange={(e) => setTempSettings(prev => ({ ...prev, leftoverSavingsAmount: parseFloat(e.target.value) }))}
                                        className={`w-full p-2 mt-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100'}`}
                                    />
                                )}
                            </div>
                            <div>
                                {isPWA ? (
                                    <>
                                        <label className="block font-bold mb-2">{translations[settings.language]['notifications']}</label>
                                        <label className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={tempSettings.notificationsEnabled}
                                                onChange={handleNotificationPermission}
                                                className="mr-2"
                                            />
                                            {translations[settings.language]['enable_notifications']}
                                        </label>
                                        {tempSettings.notificationsEnabled && (
                                            <button onClick={handleTestNotification} className="mt-2 text-indigo-500 hover:underline">
                                                {translations[settings.language]['test_notification']}
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <p className="mt-4 text-sm text-gray-500">
                                        {translations[settings.language]['pwa_instructions']}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'tips' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block font-bold mb-2">{translations[settings.language]['enable_tips']}</label>
                                <label className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={tempSettings.tipsEnabled}
                                        onChange={() => setTempSettings(prev => ({ ...prev, tipsEnabled: !prev.tipsEnabled }))}
                                        className="mr-2"
                                    />
                                    {translations[settings.language]['enable_tips']}
                                </label>
                            </div>
                            <div>
                                <label className="block font-bold mb-2">{translations[settings.language]['tips_settings']}</label>
                                <div className="space-y-2">
                                    {Object.keys(translations[settings.language]).filter(key => key.includes('_tip')).map(tipKey => (
                                        <label key={tipKey} className="flex items-center space-x-2">
                                            <input
                                                type="checkbox"
                                                checked={tempSettings.activeTips.includes(tipKey)}
                                                onChange={() => {
                                                    setTempSettings(prev => {
                                                        const newTips = prev.activeTips.includes(tipKey)
                                                            ? prev.activeTips.filter(tip => tip !== tipKey)
                                                            : [...prev.activeTips, tipKey];
                                                        return { ...prev, activeTips: newTips };
                                                    });
                                                }}
                                                className="mr-2"
                                            />
                                            {translations[settings.language][tipKey]}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleSave}
                        className="mt-6 w-full p-3 bg-green-600 text-white rounded-xl shadow-lg hover:bg-green-700 transition-colors duration-200"
                    >
                        {translations[settings.language]['save_changes']}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const NotificationsModal = () => {
    const { showNotificationsModal, setShowNotificationsModal, notifications, removeNotification, settings } = useAppContext();
    return (
        <Modal title={translations[settings.language]['notifications']} isOpen={showNotificationsModal} onClose={() => setShowNotificationsModal(false)}>
            <div dir={settings.language === 'he' ? 'rtl' : 'ltr'} className="space-y-4 max-h-[70vh] overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map((notification) => (
                        <div key={notification.id} className={`p-4 rounded-xl shadow-md flex items-center justify-between ${settings.theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                            <div>
                                <h3 className="font-bold text-lg">{notification.title}</h3>
                                <p className="text-sm">{notification.body}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(notification.timestamp).toLocaleString(settings.language, { dateStyle: 'short', timeStyle: 'short' })}
                                </p>
                            </div>
                            <button onClick={() => removeNotification(notification.id)} className="text-red-500 hover:text-red-700 transition-colors duration-200">
                                <FaTimes />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-500">{translations[settings.language]['no_notifications']}</p>
                )}
            </div>
        </Modal>
    );
};

const TipsComponent = () => {
    const { settings, user, setShowSettingsModal, setToastMessage, setShowToast } = useAppContext();
    const [currentTip, setCurrentTip] = useState(null);

    useEffect(() => {
        if (!settings.tipsEnabled) return;

        const showTip = () => {
            let availableTips = [...settings.activeTips];
            if (user && !user.isAnonymous) {
                availableTips = availableTips.filter(tip => tip !== 'login_tip');
            } else if (user?.isAnonymous) {
                availableTips = availableTips.filter(tip => tip !== 'login_tip');
                availableTips.push('login_tip');
            }

            if (availableTips.length > 0) {
                const randomTipKey = availableTips[Math.floor(Math.random() * availableTips.length)];
                setCurrentTip(translations[settings.language][randomTipKey]);
                const timer = setTimeout(() => {
                    setCurrentTip(null);
                }, 25000); // 25 seconds
                return () => clearTimeout(timer);
            }
        };

        const interval = setInterval(showTip, 60000); // Show a new tip every minute
        showTip(); // Show a tip on initial load
        
        return () => clearInterval(interval);
    }, [settings.tipsEnabled, settings.activeTips, user, settings.language]);

    if (!currentTip) return null;

    return (
        <div dir={settings.language === 'he' ? 'rtl' : 'ltr'} className={`fixed top-4 z-50 p-4 rounded-xl shadow-lg transition-all duration-300 transform ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} ${settings.language === 'he' ? 'right-4' : 'left-4'}`} style={{ fontFamily: settings.fontFamily }}>
            {currentTip}
        </div>
    );
};

const Dashboard = () => {
    const { user, settings, transactions, addTransaction, savingsGoals, setToastMessage, setShowToast } = useAppContext();
    const [transaction, setTransaction] = useState({ type: 'expense', amount: '', description: '', date: new Date().toISOString().substring(0, 10) });

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    // Budget Calculation
    const startDate = new Date(settings.budgetPeriodStart);
    const endDate = new Date(settings.budgetPeriodEnd);
    const diffTime = endDate.getTime() - startDate.getTime();
    const totalDaysInPeriod = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const daysPassed = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Total savings needed for goals
    const totalSavingsNeededForGoals = savingsGoals.reduce((sum, goal) => {
        const goalDeadline = new Date(goal.deadline);
        if (goalDeadline > new Date()) {
            const daysLeft = Math.ceil((goalDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) + 1;
            const savedAmount = transactions.filter(t => t.type === 'expense').reduce((sum, t) => {
                const date = new Date(t.date);
                if (date >= startDate && date <= goalDeadline) {
                    return sum - t.amount;
                }
                return sum;
            }, 0);
            return sum + (goal.amount - savedAmount > 0 ? (goal.amount - savedAmount) / daysLeft : 0);
        }
        return sum;
    }, 0);

    const dailyBudget = settings.budgetAmount / totalDaysInPeriod;
    const totalSpentToday = transactions.filter(t => new Date(t.date).toDateString() === new Date().toDateString()).reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0);
    const remainingBudgetToday = dailyBudget - totalSpentToday - totalSavingsNeededForGoals;

    const budgetStatusMessage = remainingBudgetToday >= 0 ?
        `${translations[settings.language]['remaining_budget_today']}: ${remainingBudgetToday.toFixed(2)} ${settings.currency}` :
        `${translations[settings.language]['over_budget_message']} ${Math.abs(remainingBudgetToday).toFixed(2)} ${settings.currency}`;

    const handleAddTransaction = () => {
        addTransaction(transaction);
        setTransaction({ ...transaction, amount: '', description: '' });
    };

    return (
        <div dir={settings.language === 'he' ? 'rtl' : 'ltr'} className="container mx-auto p-4 flex flex-col gap-8">
            <div className={`p-6 rounded-3xl shadow-lg ${settings.transparent ? 'backdrop-blur-md bg-opacity-40' : 'bg-opacity-90'} ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                <h2 className={`font-bold mb-4 text-2xl ${settings.language === 'he' ? 'text-right' : 'text-left'}`}>
                    {translations[settings.language]['budget']}
                </h2>
                <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center ${settings.language === 'he' ? 'text-right' : 'text-left'}`}>
                    <div>
                        <p className="text-sm text-gray-500 font-bold">{translations[settings.language]['total_budget']}</p>
                        <p className="text-xl font-bold">{settings.budgetAmount.toFixed(2)} {settings.currency}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold">{translations[settings.language]['total_income']}</p>
                        <p className="text-xl font-bold">{totalIncome.toFixed(2)} {settings.currency}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold">{translations[settings.language]['total_spent']}</p>
                        <p className="text-xl font-bold">{totalExpenses.toFixed(2)} {settings.currency}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-bold">{translations[settings.language]['remaining_budget_today']}</p>
                        <p className="text-xl font-bold" style={{ color: remainingBudgetToday >= 0 ? 'green' : 'red' }}>
                            {remainingBudgetToday.toFixed(2)} {settings.currency}
                        </p>
                    </div>
                </div>
            </div>
            <div className={`p-6 rounded-3xl shadow-lg ${settings.transparent ? 'backdrop-blur-md bg-opacity-40' : 'bg-opacity-90'} ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                <h2 className="font-bold mb-4 text-2xl">{translations[settings.language]['add_transaction']}</h2>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold mb-1">{translations[settings.language]['transaction_type']}</label>
                        <select
                            value={transaction.type}
                            onChange={(e) => setTransaction({ ...transaction, type: e.target.value })}
                            className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                        >
                            <option value="expense">{translations[settings.language]['expense']}</option>
                            <option value="income">{translations[settings.language]['income']}</option>
                        </select>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold mb-1">{translations[settings.language]['amount']}</label>
                        <input
                            type="number"
                            value={transaction.amount}
                            onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
                            className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold mb-1">{translations[settings.language]['description']}</label>
                        <input
                            type="text"
                            value={transaction.description}
                            onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
                            className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                        />
                    </div>
                     <div className="flex-1 w-full">
                        <label className="block text-sm font-bold mb-1">{translations[settings.language]['date']}</label>
                        <input
                            type="date"
                            value={transaction.date}
                            onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
                            className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                        />
                    </div>
                    <button
                        onClick={handleAddTransaction}
                        className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                        <FaPlus />
                    </button>
                </div>
            </div>
        </div>
    );
};

const Tables = () => {
    const { transactions, settings } = useAppContext();
    return (
        <div dir={settings.language === 'he' ? 'rtl' : 'ltr'} className="container mx-auto p-4">
            <div className={`p-6 rounded-3xl shadow-lg ${settings.transparent ? 'backdrop-blur-md bg-opacity-40' : 'bg-opacity-90'} ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                <h2 className="font-bold mb-4 text-2xl">{translations[settings.language]['transaction_history']}</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead>
                            <tr className={`${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {translations[settings.language]['date']}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {translations[settings.language]['transaction_type']}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {translations[settings.language]['description']}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    {translations[settings.language]['amount_in']} {settings.currency}
                                </th>
                            </tr>
                        </thead>
                        <tbody className={`${settings.theme === 'dark' ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-200'}`}>
                            {transactions.map((t, index) => (
                                <tr key={index}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {translations[settings.language][t.type]}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {t.description}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {t.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const Savings = () => {
    const { savingsGoals, addSavingGoal, deleteSavingGoal, settings, transactions } = useAppContext();
    const [goal, setGoal] = useState({ name: '', amount: '', deadline: new Date().toISOString().substring(0, 10) });

    const handleAddGoal = () => {
        addSavingGoal(goal);
        setGoal({ name: '', amount: '', deadline: new Date().toISOString().substring(0, 10) });
    };

    return (
        <div dir={settings.language === 'he' ? 'rtl' : 'ltr'} className="container mx-auto p-4 flex flex-col gap-8">
            <div className={`p-6 rounded-3xl shadow-lg ${settings.transparent ? 'backdrop-blur-md bg-opacity-40' : 'bg-opacity-90'} ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                <h2 className="font-bold mb-4 text-2xl">{translations[settings.language]['add_savings_goal']}</h2>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold mb-1">{translations[settings.language]['goal_name']}</label>
                        <input
                            type="text"
                            value={goal.name}
                            onChange={(e) => setGoal({ ...goal, name: e.target.value })}
                            className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold mb-1">{translations[settings.language]['goal_amount']}</label>
                        <input
                            type="number"
                            value={goal.amount}
                            onChange={(e) => setGoal({ ...goal, amount: e.target.value })}
                            className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                        />
                    </div>
                    <div className="flex-1 w-full">
                        <label className="block text-sm font-bold mb-1">{translations[settings.language]['deadline']}</label>
                        <input
                            type="date"
                            value={goal.deadline}
                            onChange={(e) => setGoal({ ...goal, deadline: e.target.value })}
                            className={`w-full p-2 rounded-xl ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}
                        />
                    </div>
                    <button
                        onClick={handleAddGoal}
                        className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-colors duration-200"
                    >
                        {translations[settings.language]['save_goal']}
                    </button>
                </div>
            </div>
            <div className={`mt-8 p-6 rounded-3xl shadow-lg ${settings.transparent ? 'backdrop-blur-md bg-opacity-40' : 'bg-opacity-90'} ${settings.theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                <h2 className="font-bold mb-4 text-2xl">{translations[settings.language]['current_saving_goals']}</h2>
                {savingsGoals.length > 0 ? (
                    <div className="space-y-4">
                        {savingsGoals.map(goal => {
                            const deadline = new Date(goal.deadline);
                            const daysLeft = Math.ceil((deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            const dailySavingsNeeded = daysLeft > 0 ? (goal.amount / daysLeft).toFixed(2) : goal.amount.toFixed(2);
                            const currentSaved = transactions.filter(t => t.description.includes(goal.name)).reduce((sum, t) => t.type === 'expense' ? sum - t.amount : sum + t.amount, 0);

                            return (
                                <div key={goal.id} className={`p-4 rounded-xl shadow-md flex items-center justify-between ${settings.theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'}`}>
                                    <div>
                                        <h3 className="font-bold text-lg">{goal.name}</h3>
                                        <p className="text-sm">
                                            {translations[settings.language]['goal_amount']}: {goal.amount.toFixed(2)} {settings.currency}
                                        </p>
                                        <p className="text-sm">
                                            {translations[settings.language]['deadline']}: {new Date(goal.deadline).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm font-bold mt-2">
                                            {translations[settings.language]['daily_savings_needed']}: {dailySavingsNeeded} {settings.currency}
                                        </p>
                                    </div>
                                    <button onClick={() => deleteSavingGoal(goal.id)} className="text-red-500 hover:text-red-700 transition-colors duration-200">
                                        <FaTrash />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-gray-500">{translations[settings.language]['no_goals_yet']}</p>
                )}
            </div>
        </div>
    );
};

// Main App component
const App = () => {
    const { user, isAuthReady, currentPage, showLoginModal, showSettingsModal, showNotificationsModal, showToast, toastMessage, setShowToast, settings, setCurrentPage, addNotification } = useAppContext();

    // Check budget at the end of the day or period
    useEffect(() => {
        if (!user || user.isAnonymous) return;
        
        const checkBudget = () => {
            const now = new Date();
            const today = now.toLocaleDateString();
            
            // Daily check
            const totalSpentToday = transactions.filter(t => new Date(t.date).toLocaleDateString() === today).reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0);
            const dailyBudget = settings.budgetAmount / ((new Date(settings.budgetPeriodEnd).getTime() - new Date(settings.budgetPeriodStart).getTime()) / (1000 * 60 * 60 * 24) + 1);

            if (totalSpentToday > dailyBudget) {
                addNotification({
                    title: translations[settings.language]['notification_title_over'],
                    body: `${translations[settings.language]['over_budget_message']} ${(totalSpentToday - dailyBudget).toFixed(2)} ${settings.currency}.`,
                });
            } else {
                 addNotification({
                    title: translations[settings.language]['notification_title_under'],
                    body: `${translations[settings.language]['under_budget_message']} ${(dailyBudget - totalSpentToday).toFixed(2)} ${settings.currency}.`,
                });
            }
        };

        const checkEndOfPeriod = () => {
            const endDate = new Date(settings.budgetPeriodEnd);
            const now = new Date();
            if (now > endDate) {
                const totalExpenses = transactions.reduce((sum, t) => t.type === 'expense' ? sum + t.amount : sum, 0);
                if (totalExpenses > settings.budgetAmount) {
                    addNotification({
                        title: translations[settings.language]['notification_end_of_period'],
                        body: translations[settings.language]['notification_end_of_period_over'],
                    });
                } else {
                     addNotification({
                        title: translations[settings.language]['notification_end_of_period'],
                        body: translations[settings.language]['notification_end_of_period_under'],
                    });
                }
            }
        };

        const dailyTimer = setInterval(checkBudget, 86400000); // 24 hours
        const periodTimer = setInterval(checkEndOfPeriod, 3600000); // Check every hour
        
        return () => {
            clearInterval(dailyTimer);
            clearInterval(periodTimer);
        };
    }, [user, transactions, settings, addNotification]);

    const getPageContent = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'tables':
                return <Tables />;
            case 'savings':
                return <Savings />;
            default:
                return <Dashboard />;
        }
    };
    
    // Set the overall document theme
    const bodyClass = `${settings.theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-900'} ${settings.transparent ? 'bg-opacity-80' : ''}`;
    const rootStyle = {
        fontFamily: settings.fontFamily,
        backgroundImage: settings.backgroundImage ? `url(${settings.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
    };
    
    return (
        <div className={bodyClass} style={rootStyle}>
            <Helmet>
                <html lang={settings.language} dir={settings.language === 'he' ? 'rtl' : 'ltr'} />
                <title>{translations[settings.language]['app_name']}</title>
            </Helmet>
            <Header />
            <TipsComponent />
            <main className="min-h-[calc(100vh-120px)] pt-8 pb-16">
                {isAuthReady && getPageContent()}
            </main>
            <footer className={`p-4 text-center text-sm ${settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {translations[settings.language]['all_rights_reserved']} 2025
            </footer>
            {showLoginModal && <LoginModal />}
            {showSettingsModal && <SettingsModal />}
            {showNotificationsModal && <NotificationsModal />}
            <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
        </div>
    );
};

const Root = () => (
    <AppProvider>
        <App />
    </AppProvider>
);

export default Root;
