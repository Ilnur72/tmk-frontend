import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const showToast = (message: string) => {
    setError(message);
    setTimeout(() => {
      setError("");
    }, 5000);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const success = await login(email, password);

      if (success) {
        navigate("/factory");
      } else {
        showToast("Нотўғри электрон почта ёки пароль");
      }
    } catch (error) {
      showToast("Сервер билан боғланишда хатолик юз берди");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* CSS styles */}
      <style>{`
        body { 
          position: relative; 
          margin: 0; 
          padding: 0; 
          overflow-x: hidden;
        }
        body::before { 
          content: ""; 
          position: fixed; 
          top: 0; 
          left: 0; 
          width: 100%;
          height: 100%; 
          background-image: url('/image/back.jpg');
          background-size: cover; 
          background-position: center; 
          opacity: 0.5;
          z-index: -1; 
        } 
        .toast { 
          position: fixed; 
          top: 20px; 
          right: 20px; 
          padding: 15px 20px; 
          background-color: #ff3e1d; 
          color: white; 
          border-radius: 4px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); 
          z-index: 9999; 
          transform: translateX(150%); 
          transition: transform 0.3s ease; 
        } 
        .toast.show {
          transform: translateX(0); 
        }
      `}</style>

      {/* Toast notification */}
      {error && <div className={`toast ${error ? "show" : ""}`}>{error}</div>}

      <div className="p-3 sm:px-8 relative h-screen lg:overflow-hidden bg-primary xl:bg-white dark:bg-darkmode-800 xl:dark:bg-darkmode-600 before:hidden before:xl:block before:content-[''] before:w-[57%] before:-mt-[28%] before:-mb-[16%] before:-ml-[13%] before:absolute before:inset-y-0 before:left-0 before:transform before:rotate-[-4.5deg] before:bg-primary/20 before:rounded-[100%] before:dark:bg-darkmode-400 after:hidden after:xl:block after:content-[''] after:w-[57%] after:-mt-[20%] after:-mb-[13%] after:-ml-[13%] after:absolute after:inset-y-0 after:left-0 after:transform after:rotate-[-4.5deg] after:bg-primary after:rounded-[100%] after:dark:bg-darkmode-700">
        <div className="container relative z-10 sm:px-10">
          <div className="block grid-cols-2 gap-4 xl:grid">
            {/* BEGIN: Login Info */}
            <div className="hidden min-h-screen flex-col xl:flex">
              <div className="my-auto">
                <img
                  className="-intro-x -mt-16 w-1/2"
                  src="/image/logo-full-w.png"
                  alt="Logo"
                />
                <div className="-intro-x mt-10 text-4xl font-medium leading-tight text-white">
                  Har bir maʼdan
                  <br />
                  boʻlagini qadrlaymiz!
                </div>
                <div className="-intro-x mt-5 text-lg text-white text-opacity-70 dark:text-slate-400">
                  Tahliliy monitoring tizimi
                </div>
              </div>
            </div>
            {/* END: Login Info */}

            {/* BEGIN: Login Form */}
            <div className="flex h-screen xl:my-0 xl:h-auto xl:py-0">
              <div className="mx-auto my-auto w-full rounded-md bg-white px-5 py-8 shadow-md dark:bg-darkmode-600 sm:w-3/4 sm:px-8 lg:w-2/4 xl:ml-20 xl:w-auto xl:bg-transparent xl:p-0 xl:shadow-none">
                <div className="intro-x mt-2 text-center text-slate-400 xl:hidden mb-5">
                  <center>
                    <img
                      className="w-100"
                      src="/image/logo-uz.png"
                      alt="Logo UZ"
                    />
                  </center>
                  <div className="-intro-x mt-5 text-lg text-primary text-opacity-70 dark:text-slate-400">
                    Таҳлилий мониторинг тизими
                  </div>
                </div>

                <h2 className="intro-x text-center text-2xl font-bold xl:text-left xl:text-3xl">
                  Тизимга кириш
                </h2>

                <form onSubmit={handleSubmit}>
                  <div className="intro-x mt-8">
                    <input
                      data-tw-merge=""
                      name="login"
                      type="text"
                      required
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-darkmode-800/50 dark:disabled:border-transparent [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 [&[readonly]]:dark:border-transparent transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80 group-[.form-inline]:flex-1 group-[.input-group]:rounded-none group-[.input-group]:[&:not(:first-child)]:border-l-transparent group-[.input-group]:first:rounded-l group-[.input-group]:last:rounded-r group-[.input-group]:z-10 intro-x block min-w-full px-4 py-3 xl:min-w-[350px]"
                    />
                    <input
                      data-tw-merge=""
                      name="password"
                      type="password"
                      required
                      placeholder="Пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="disabled:bg-slate-100 disabled:cursor-not-allowed dark:disabled:bg-darkmode-800/50 dark:disabled:border-transparent [&[readonly]]:bg-slate-100 [&[readonly]]:cursor-not-allowed [&[readonly]]:dark:bg-darkmode-800/50 [&[readonly]]:dark:border-transparent transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary focus:border-opacity-40 dark:bg-darkmode-800 dark:border-transparent dark:focus:ring-slate-700 dark:focus:ring-opacity-50 dark:placeholder:text-slate-500/80 group-[.form-inline]:flex-1 group-[.input-group]:rounded-none group-[.input-group]:[&:not(:first-child)]:border-l-transparent group-[.input-group]:first:rounded-l group-[.input-group]:last:rounded-r group-[.input-group]:z-10 intro-x mt-4 block min-w-full px-4 py-3 xl:min-w-[350px]"
                    />
                    <br />
                    <br />
                    <span className="p-2 text-danger"></span>
                  </div>

                  <div className="intro-x mt-5 text-center xl:mt-8 xl:text-left">
                    <button
                      data-tw-merge=""
                      type="submit"
                      disabled={loading}
                      className="transition duration-200 border shadow-sm inline-flex items-center justify-center rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus-visible:outline-none dark:focus:ring-slate-700 dark:focus:ring-opacity-50 [&:hover:not(:disabled)]:bg-opacity-90 [&:hover:not(:disabled)]:border-opacity-90 [&:not(button)]:text-center disabled:opacity-70 disabled:cursor-not-allowed bg-primary border-primary text-white dark:border-primary w-full px-4 py-3 align-top xl:mr-3 xl:w-32"
                    >
                      {loading ? "Кутинг..." : "Кириш"}
                    </button>
                  </div>
                </form>
                <div className="intro-x mt-10 text-center text-slate-600 dark:text-slate-500 xl:mt-24 xl:text-left"></div>
              </div>
            </div>
            {/* END: Login Form */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
