"use client";
import { ComboBox } from "@mescius/wijmo.react.input";

interface TextInputProps {
  label: string;
  value?: string | null;
  isReadOnly?: boolean;
}

export const TextInput = ({
  label,
  value,
  isReadOnly = false,
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
        ></ComboBox>
      </div>
    </div>
  );
};
