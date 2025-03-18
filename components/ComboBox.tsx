"use client";
import { ComboBox as ComboBoxBase } from "@mescius/wijmo.react.input";
import { ComboBox as IComboBox } from "@mescius/wijmo.input";

interface TextInputProps {
  label: string;
  value?: string | null;
  isReadOnly?: boolean;
  itemsSource?: string[];
  placeholder?: string;
  onChange?: (value: string) => void;
}

export const ComboBox = ({
  label,
  value,
  isReadOnly = false,
  onChange,
  itemsSource,
}: TextInputProps) => {
  return (
    <div>
      <div className="form-group flex flex-col">
        <label htmlFor="theComboNoSrc"> {label}</label>
        <ComboBoxBase
          id="theComboNoSrc"
          isReadOnly={isReadOnly}
          itemsSource={itemsSource}
          text={value}
          isRequired={false}
          selectedIndex={-1}
          style={{ backgroundColor: isReadOnly ? "#f5f5f5" : "white" }}
          textChanged={(e: IComboBox) => {
            onChange?.(e.text ?? "");
          }}
        ></ComboBoxBase>
      </div>
    </div>
  );
};
