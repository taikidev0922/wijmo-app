"use client";
import { ComboBox } from "@mescius/wijmo.react.input";
import { ComboBox as IComboBox } from "@mescius/wijmo.input";

interface TextInputProps {
  label: string;
  value?: string | null;
  key?: string;
  isReadOnly?: boolean;
  onChange?: (value: string) => void;
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
          textChanged={(e: IComboBox) => {
            onChange?.(e.text ?? "");
          }}
        ></ComboBox>
      </div>
    </div>
  );
};
