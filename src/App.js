import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, serverTimestamp } from 'firebase/firestore';

// --- Components ---

// Navigation Component
const Navbar = ({ setCurrentPage }) => {
    return (
        <nav className="bg-indigo-700 p-4 rounded-t-xl">
            <ul className="flex justify-center space-x-6">
                <li>
                    <button
                        onClick={() => setCurrentPage('biodata')}
                        className="text-white hover:text-indigo-200 font-semibold transition duration-200 ease-in-out py-2 px-4 rounded-lg hover:bg-indigo-600"
                    >
                        Biodata Form
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setCurrentPage('articles')}
                        className="text-white hover:text-indigo-200 font-semibold transition duration-200 ease-in-out py-2 px-4 rounded-lg hover:bg-indigo-600"
                    >
                        Article Submission
                    </button>
                </li>
                <li>
                    <button
                        onClick={() => setCurrentPage('allArticles')}
                        className="text-white hover:text-indigo-200 font-semibold transition duration-200 ease-in-out py-2 px-4 rounded-lg hover:bg-indigo-600"
                    >
                        View All Articles
                    </button>
                </li>
            </ul>
        </nav>
    );
};

// Biodata Form Component
const BiodataForm = ({ db, userId, appId, setSubmitError }) => {
    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [gender, setGender] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!name.trim() || !dob.trim() || !gender.trim() || !address.trim() || !phone.trim() || !email.trim()) {
            setSubmitError('All biodata fields are required.');
            return;
        }
        if (!db || !userId || !appId) {
            setSubmitError('Application not ready. Please wait or refresh.');
            return;
        }

        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/biodata_entries`), {
                name: name.trim(),
                dob: dob.trim(),
                gender: gender.trim(),
                address: address.trim(),
                phone: phone.trim(),
                email: email.trim(),
                authorId: userId,
                timestamp: serverTimestamp(),
            });
            setName(''); setDob(''); setGender(''); setAddress(''); setPhone(''); setEmail('');
        } catch (error) {
            console.error("Error adding biodata document:", error);
            setSubmitError("Failed to submit biodata. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">Submit Your Biodata</h2>
            <div className="relative">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
                       placeholder="Enter your full name" required />
            </div>
            <div className="relative">
                <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" id="dob" value={dob} onChange={(e) => setDob(e.target.value)}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
                       required />
            </div>
            <div className="relative">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
                        required>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div className="relative">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea id="address" value={address} onChange={(e) => setAddress(e.target.value)} rows="3"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm resize-y"
                          placeholder="Enter your full address" required></textarea>
            </div>
            <div className="relative">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
                       placeholder="e.g., +1234567890" required />
            </div>
            <div className="relative">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
                       placeholder="e.g., example@domain.com" required />
            </div>
            <button type="submit"
                    className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-105">
                Submit Biodata
            </button>
        </form>
    );
};

// Article Submission Form Component
const ArticleForm = ({ db, userId, appId, setSubmitError }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!title.trim() || !content.trim()) {
            setSubmitError('Article title and content cannot be empty.');
            return;
        }
        if (!db || !userId || !appId) {
            setSubmitError('Application not ready. Please wait or refresh.');
            return;
        }

        try {
            await addDoc(collection(db, `artifacts/${appId}/public/data/article_entries`), {
                title: title.trim(),
                content: content.trim(),
                imageUrl: imagePreview,
                authorId: userId,
                timestamp: serverTimestamp(),
            });
            setTitle('');
            setContent('');
            setImageFile(null);
            setImagePreview(null);
        } catch (error) {
            console.error("Error adding article document:", error);
            setSubmitError("Failed to submit article. Please try again.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mb-8 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">Submit Your Article</h2>
            <div className="relative">
                <label htmlFor="articleTitle" className="block text-sm font-medium text-gray-700 mb-1">Article Title</label>
                <input type="text" id="articleTitle" value={title} onChange={(e) => setTitle(e.target.value)}
                       className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm"
                       placeholder="Enter your article title" required />
            </div>
            <div className="relative">
                <label htmlFor="articleContent" className="block text-sm font-medium text-gray-700 mb-1">Article Content</label>
                <textarea id="articleContent" value={content} onChange={(e) => setContent(e.target.value)} rows="10"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm resize-y"
                          placeholder="Write your article content here..." required></textarea>
            </div>
            <div className="relative">
                <label htmlFor="articleImage" className="block text-sm font-medium text-gray-700 mb-1">Upload Image (Optional)</label>
                <input type="file" id="articleImage" accept="image/*" onChange={handleImageChange}
                       className="w-full text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {imagePreview && (
                    <div className="mt-4 flex justify-center">
                        <img src={imagePreview} alt="Image Preview" className="max-w-full h-auto rounded-lg shadow-md border border-gray-200" style={{ maxHeight: '200px' }} />
                    </div>
                )}
            </div>
            <button type="submit"
                    className="w-full bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out transform hover:scale-105">
                Submit Article
            </button>
        </form>
    );
};

// Generic Entry List Component (for biodata or articles on their respective pages)
const EntryList = ({ entries, title, emptyMessage }) => {
    return (
        <div className="mt-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-5 border-b pb-3">
                {title}
            </h2>
            {entries.length === 0 ? (
                <p className="text-gray-600 text-center py-8">{emptyMessage}</p>
            ) : (
                <div className="grid gap-6">
                    {entries.map((entry) => (
                        <div key={entry.id} className="bg-gray-50 border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition duration-200 ease-in-out">
                            {entry.name && ( // Biodata entry
                                <>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{entry.name}</h3>
                                    <p className="text-gray-700 text-base">
                                        <strong>DOB:</strong> {entry.dob}<br/>
                                        <strong>Gender:</strong> {entry.gender}<br/>
                                        <strong>Address:</strong> {entry.address}<br/>
                                        <strong>Phone:</strong> {entry.phone}<br/>
                                        <strong>Email:</strong> {entry.email}
                                    </p>
                                </>
                            )}
                            {entry.title && entry.content && ( // Article entry
                                <>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{entry.title}</h3>
                                    {entry.imageUrl && (
                                        <div className="my-4 flex justify-center">
                                            <img src={entry.imageUrl} alt={entry.title} className="max-w-full h-auto rounded-lg shadow-md border border-gray-200" style={{ maxHeight: '300px' }} />
                                        </div>
                                    )}
                                    <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                                </>
                            )}
                            <div className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between sm:items-center">
                                <span>Submitted by: <span className="font-mono text-gray-600 break-words">{entry.authorId}</span></span>
                                {entry.timestamp && (
                                    <span className="mt-2 sm:mt-0">
                                        on {new Date(entry.timestamp.toDate()).toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// New All Articles Page Component
const AllArticlesPage = ({ db, userId, appId, setSubmitError }) => { // Added appId prop
    const [articles, setArticles] = useState([]);
    const [loadingArticles, setLoadingArticles] = useState(true);

    useEffect(() => {
        if (db && userId && appId) { // Check appId
            const articleCollectionRef = collection(db, `artifacts/${appId}/public/data/article_entries`);
            const q = query(articleCollectionRef);

            const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                const fetchedArticles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                fetchedArticles.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
                setArticles(fetchedArticles);
                setLoadingArticles(false);
            }, (error) => {
                console.error("Error fetching all articles:", error);
                setSubmitError("Failed to load articles. Please refresh the page.");
                setLoadingArticles(false);
            });
            return () => unsubscribeSnapshot();
        }
    }, [db, userId, appId]); // Added appId to dependency array

    if (loadingArticles) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-xl font-semibold text-gray-700">Loading articles...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-center text-green-700 mb-6">Explore All Articles</h2>
            {articles.length === 0 ? (
                <p className="text-gray-600 text-center py-8">No articles have been submitted yet.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {articles.map((article) => (
                        <div key={article.id} className="bg-white border border-green-200 rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
                            {article.imageUrl && (
                                <img src={article.imageUrl} alt={article.title} className="w-full h-48 object-cover" />
                            )}
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-green-800 mb-2">{article.title}</h3>
                                <p className="text-gray-700 text-sm line-clamp-4">{article.content}</p>
                                <div className="text-xs text-gray-500 mt-3">
                                    Submitted by: <span className="font-mono break-words">{article.authorId}</span>
                                    {article.timestamp && (
                                        <span className="block mt-1">
                                            on {new Date(article.timestamp.toDate()).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


// --- Main App Component ---
const App = () => {
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [biodataEntries, setBiodataEntries] = useState([]);
    const [articleEntries, setArticleEntries] = useState([]);
    const [submitError, setSubmitError] = useState('');
    const [currentPage, setCurrentPage] = useState('biodata');

    // Your actual Firebase configuration.
    // This should be placed outside the useEffect so it's defined once.
    // IMPORTANT: Make sure these values are correct from your Firebase project!
    const firebaseConfig = {
      apiKey: "AIzaSyBJrusW1-RWzTPQiCgzbzLh60w16eSGavk",
      authDomain: "my-multi-form-app.firebaseapp.com",
      projectId: "my-multi-form-app",
      storageBucket: "my-multi-form-app.firebasestorage.app",
      messagingSenderId: "873659782095",
      appId: "1:873659782095:web:5f7006a771210f889638ba",
      measurementId: "G-85K1HEW1DL"
    };

    // Extract appId directly from the config for consistent use
    const myAppId = firebaseConfig.appId;


    // Initialize Firebase and handle authentication
    useEffect(() => {
        const initializeFirebase = async () => {
            try {
                // Log the config being used for debugging
                console.log("Initializing Firebase with config:", firebaseConfig);
                const app = initializeApp(firebaseConfig);
                const firestoreDb = getFirestore(app);
                const firebaseAuth = getAuth(app);

                setDb(firestoreDb);
                setAuth(firebaseAuth);

                const unsubscribeAuth = onAuthStateChanged(firebaseAuth, async (user) => {
                    if (user) {
                        setUserId(user.uid);
                        setLoading(false);
                    } else {
                        // For public deployment, anonymous sign-in is simple.
                        // If you need more robust user accounts, you'd implement
                        // email/password, Google Sign-In, etc., here.
                        await signInAnonymously(firebaseAuth);
                    }
                });
                return () => unsubscribeAuth();
            } catch (error) {
                console.error("Error initializing Firebase:", error);
                if (error.code === 'auth/configuration-not-found') {
                    setSubmitError("Firebase Authentication configuration error. Please ensure 'authDomain' and 'projectId' are correct in your firebaseConfig, and that Anonymous Authentication is enabled in your Firebase project console.");
                } else {
                    setSubmitError("Failed to initialize the application. Please try again.");
                }
                setLoading(false);
            }
        };
        initializeFirebase();
    }, []);

    // Fetch Biodata Entries
    useEffect(() => {
        if (db && userId && myAppId) {
            const biodataCollectionRef = collection(db, `artifacts/${myAppId}/public/data/biodata_entries`);
            const q = query(biodataCollectionRef);

            const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                const fetchedEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                fetchedEntries.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
                setBiodataEntries(fetchedEntries);
            }, (error) => {
                console.error("Error fetching biodata entries:", error);
                setSubmitError("Failed to load biodata entries. Please refresh the page.");
            });
            return () => unsubscribeSnapshot();
        }
    }, [db, userId, myAppId]);

    // Fetch Article Entries (for the article submission page)
    useEffect(() => {
        if (db && userId && myAppId) {
            const articleCollectionRef = collection(db, `artifacts/${myAppId}/public/data/article_entries`);
            const q = query(articleCollectionRef);

            const unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
                const fetchedEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                fetchedEntries.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
                setArticleEntries(fetchedEntries);
            }, (error) => {
                console.error("Error fetching article entries:", error);
                setSubmitError("Failed to load article entries. Please refresh the page.");
            });
            return () => unsubscribeSnapshot();
        }
    }, [db, userId, myAppId]);


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100">
                <div className="text-xl font-semibold text-gray-700">Loading application...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6 lg:p-8 font-sans antialiased">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
                <Navbar setCurrentPage={setCurrentPage} />

                <div className="p-6 sm:p-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-indigo-700 mb-6">
                        Multi-Form Data Submission
                    </h1>

                    {/* User ID Display */}
                    {userId && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg mb-6 text-sm break-words">
                            Your User ID: <span className="font-mono text-blue-900 select-all">{userId}</span>
                        </div>
                    )}

                    {submitError && (
                        <div className="text-red-600 text-sm font-medium text-center mb-4">{submitError}</div>
                    )}

                    {/* Conditional Rendering of Forms and Lists */}
                    {currentPage === 'biodata' && (
                        <>
                            <BiodataForm db={db} userId={userId} appId={myAppId} setSubmitError={setSubmitError} />
                            <EntryList entries={biodataEntries} title="Submitted Biodata" emptyMessage="No biodata entries yet. Be the first to submit!" />
                        </>
                    )}

                    {currentPage === 'articles' && (
                        <>
                            <ArticleForm db={db} userId={userId} appId={myAppId} setSubmitError={setSubmitError} />
                            <EntryList entries={articleEntries} title="Submitted Articles" emptyMessage="No article entries yet. Be the first to submit!" />
                        </>
                    )}

                    {currentPage === 'allArticles' && (
                        <AllArticlesPage db={db} userId={userId} appId={myAppId} setSubmitError={setSubmitError} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default App;
