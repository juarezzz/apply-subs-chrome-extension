import styles from "./styles.module.css";

interface Props {
  children?: React.ReactNode;
  subtitle?: string;
}

export const Title = ({ children, subtitle }: Props) => {
  return (
    <div>
      <h2 className={styles.title}>{children}</h2>
      {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
    </div>
  );
};
