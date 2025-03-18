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
    <Popup isDraggable={true} initialized={initPopup} className="wijmo-dialog">
      <div>
        <div
          className="wj-dialog-header cursor-move"
          title="ヘッダーをドラッグしてダイアログを移動できます"
          style={{
            userSelect: "none",
            WebkitUserSelect: "none",
            msUserSelect: "none",
          }}
        >
          {title}
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </Popup>
  );
}
