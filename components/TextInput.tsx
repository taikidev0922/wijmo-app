"use client";
import { ComboBox } from "@mescius/wijmo.react.input";
import { ComboBox as IComboBox } from "@mescius/wijmo.input";

interface TextInputProps {
  label: string;
  value?: string | null;
  isReadOnly?: boolean;
  onChange?: (value: string | null) => void;
}

export const TextInput = ({
  label,
  value,
  isReadOnly = false,
  onChange,
}: TextInputProps) => {
  return (
    <div>
      <div className="form-group flex flex-col">
        <label htmlFor="theComboNoSrc"> {label}</label>
        <ComboBox
          id="theComboNoSrc"
          isReadOnly={isReadOnly}
          text={value}
          style={{ backgroundColor: isReadOnly ? "#f5f5f5" : "white" }}
          //   onValueChanged={(sender: IComboBox) => {
          //     if (onChange) {
          //       onChange(sender.text ?? null);
          //     }
          //   }}
        ></ComboBox>
      </div>
    </div>
  );
};
