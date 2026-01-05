"use client";

import { useSelector } from "react-redux";
import { RootState } from "../redux/store/store";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Card } from "./Card";
import { Button } from "./Button";
import { FaTimes } from "react-icons/fa";

interface AuthGuardProps {
  children: React.ReactNode;
  /** Optional onClose for modals on pages like / */
  onClose?: () => void;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, onClose }) => {
  const user = useSelector((state: RootState) => state.user.user);
  const router = useRouter();
  const pathname = usePathname();

  // const handleClose = () => {
  //   if (onClose && pathname === "/") {
  //     onClose();
  //   } else {
  //     router.replace("/");
  //   }
  // };

  const handleClose = () => {
    if (onClose) {
      onClose(); // modal close
    } else if (window.history.length > 1) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" />

        {/* Modal */}
        <Card className="relative w-full max-w-sm p-5 text-center shadow-xl animate-fade-in transition-all duration-300 sm:max-w-md sm:p-6">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors text-sm"
            aria-label="Close"
          >
            <FaTimes />
          </button>

          <h2 className="font-bold text-lg sm:text-xl mb-3 text-[var(--color-foreground)]">
            Access Denied
          </h2>

          <p className="text-sm sm:text-base text-[var(--color-muted)] mb-5">
            You must log in to view this page.
          </p>

          <Link href="/login">
            <Button className="px-4 py-2 text-sm sm:px-6 sm:text-base bg-[var(--color-accent)] text-white transition-all duration-200 hover:brightness-110 active:scale-[0.98]">
              Go to Login
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
