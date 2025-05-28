import { LucideIcon } from "lucide-react";
import styles from "./styles.module.css";
import { IconButton } from "../IconButton";

interface Props {
  onClick?: () => void;
  selected?: boolean;
  title: string;
  details?: string;
  button?: {
    icon: LucideIcon;
    onClick: () => void;
  };
}

export const ListItem = ({
  button,
  title,
  onClick,
  selected,
  details,
}: Props) => {
  return (
    <div
      className={`${styles.listItem} ${selected ? styles.selected : ""}`}
      onClick={onClick}
    >
      <div>
        <div className={styles.title}>{title}</div>
        <div className={styles.details}>{details}</div>
      </div>
      {button && (
        <IconButton onClick={button.onClick} className={styles.button}>
          {<button.icon />}
        </IconButton>
      )}
    </div>
  );
};
