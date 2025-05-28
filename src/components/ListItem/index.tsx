import { LucideIcon } from "lucide-react";
import styles from "./styles.module.css";
import { IconButton } from "../IconButton";

interface Props {
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
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
  onMouseEnter,
  onMouseLeave,
  selected,
  details,
}: Props) => {
  return (
    <div
      className={`${styles.listItem} ${selected ? styles.selected : ""}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div>
        <div className={styles.title}>{title}</div>
        <div className={styles.details}>{details}</div>
      </div>
      {button && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            button.onClick();
          }}
          className={styles.button}
        >
          {<button.icon />}
        </IconButton>
      )}
    </div>
  );
};
