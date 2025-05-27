import styles from "./styles.module.css";

interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children?: React.ReactNode;
}

export const IconButton = ({ children, ...buttonProps }: Props) => {
  return (
    <button
      {...buttonProps}
      className={`${styles.iconButton} ` + (buttonProps.className || "")}
    >
      {children}
    </button>
  );
};
