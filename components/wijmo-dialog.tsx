import { Popup } from "@mescius/wijmo.react.input";
import { Popup as IPopup } from "@mescius/wijmo.input";
import { useRef } from "react";
import useEvent from "react-use-event-hook";

interface WijmoDialogProps {
  title: string;
  isOpen: boolean;
  children: React.ReactNode;
}

export function WijmoDialog({ title, isOpen, children }: WijmoDialogProps) {
  const popupRef = useRef<IPopup>(null);

  const initPopup = useEvent((popup: IPopup) => {
    popupRef.current = popup;
    if (isOpen) {
      popup.show(true);
    }
  });

  if (popupRef.current) {
    if (isOpen) {
      popupRef.current.show(true);
    } else {
      popupRef.current.hide();
    }
  }

  return (
    <Popup
      isDraggable={true}
      isResizable={true}
      initialized={initPopup}
      className="wijmo-dialog"
    >
      <div>
        <div className="wj-dialog-header" style={{ cursor: "move" }}>
          {title}
          <span style={{ fontSize: "0.8em", color: "#666", marginLeft: "8px" }}>
            (ドラッグで移動、端からサイズ変更)
          </span>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </Popup>
  );
}
