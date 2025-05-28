import styles from "./styles.module.css";

interface Props {
  children?: React.ReactNode;
}

export const Title = ({ children }: Props) => {
  return <h3 className={styles.title}>{children}</h3>;
};
