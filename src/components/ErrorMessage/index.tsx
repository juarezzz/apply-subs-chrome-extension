import { X } from "lucide-react";
import styles from "./styles.module.css";

interface Props {
  error: string;
  setError: (error: string) => void;
}

export const ErrorMessage = ({ error, setError }: Props) => {
  if (!error) return null;

  return (
    <div className={styles.errorContainer}>
      <p className={styles.errorText}>{error}</p>
      <X onClick={() => setError("")} className={styles.closeButton} />
    </div>
  );
};
