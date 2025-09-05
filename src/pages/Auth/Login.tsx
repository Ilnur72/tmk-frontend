import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth(); // logout ni ham qo‘shdik
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate("/");
        toast.success("Тизимга муваффақиятли кирдингиз 🚀");
      } else {
        toast.error("Нотўғри электрон почта ёки пароль ❌");
      }
    } catch (error) {
      toast.error("Сервер билан боғланишда хатолик юз берди ⚠️");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toastify container */}
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
                <div className="-intro-x mt-5 text-lg text-white text-opacity-70 dark:text-slate-2  00">
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
                      name="login"
                      type="text"
                      required
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="transition duration-200 ease-in-out w-full text-sm border-slate-400 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary dark:bg-darkmode-800 dark:border-slate-200 px-4 py-3"
                    />
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="Пароль"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="transition duration-200 ease-in-out w-full text-sm border-slate-200 shadow-sm rounded-md placeholder:text-slate-400/90 focus:ring-4 focus:ring-primary focus:ring-opacity-20 focus:border-primary dark:bg-darkmode-800 dark:border-slate-200 px-4 py-3 mt-4"
                    />
                  </div>

                  <div className="intro-x mt-5 text-center xl:mt-8 xl:text-left">
                    <button
                      type="submit"
                      disabled={loading}
                      className="transition duration-200 border shadow-sm inline-flex items-center justify-center rounded-md font-medium cursor-pointer focus:ring-4 focus:ring-primary focus:ring-opacity-20 dark:focus:ring-slate-700 disabled:opacity-70 disabled:cursor-not-allowed bg-primary border-primary text-white w-full px-4 py-3 xl:mr-3 xl:w-32"
                    >
                      {loading ? "Кутинг..." : "Кириш"}
                    </button>
                  </div>
                </form>

               
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
