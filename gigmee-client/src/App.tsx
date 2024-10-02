import { BrowserRouter } from "react-router-dom";
import AppRouter from "src/AppRoutes";
import { FC, ReactElement, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { ToastContainer } from "react-toastify";
import { socketService } from "src/sockets/socket.service";

const App: FC = (): ReactElement => {

  useEffect(() => {
    socketService.setupSocketConnection();
  }, [])

  return (
    <>
      <BrowserRouter>
        <ToastContainer />
        {/* This toaster will be deleted later! */}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: "8px",
              background: "#333",
              color: "#fff",
              fontSize: "16px",
              padding: "12px",
            },
            success: {
              style: {
                background: "#4caf50",
                color: "#fff",
              },
            },
            error: {
              style: {
                background: "#f44336",
                color: "#fff",
              },
            },
          }}
        />
        <div className="w-screen min-h-screen flex flex-col relative">
          <AppRouter />
        </div>
      </BrowserRouter>
    </>
  );
};

export default App;
