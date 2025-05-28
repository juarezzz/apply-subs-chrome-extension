import styles from "./styles.module.css";

interface Props {
  children?: React.ReactNode;
  subtitle?: string;
}

export const Title = ({ children, subtitle }: Props) => {
  return (
    <div>
      <h3 className={styles.title}>{children}</h3>
      {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
    </div>
  );
};
