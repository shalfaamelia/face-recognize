"use client";

import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";

const HeaderBar = ({ title, placeholder, onSearch, onAddClick, onImportClick, noMargin }) => {
  return (
    <div className={`flex justify-content-between align-items-center gap-3 flex-wrap${noMargin ? '' : ' mt-4 mb-2'}`}>
      <h4 className="m-0">{title}</h4>
      <div className="flex gap-2 flex-wrap">
        <span className="p-input-icon-left" style={{ width: "16rem" }}>
          <i className="pi pi-search ml-3" />
          <InputText
            placeholder={placeholder}
            className="w-full pl-6"
            onChange={(e) => onSearch(e.target.value.toLowerCase())}
          />
        </span>

        {onAddClick && (
          <Button label="Tambah" icon="pi pi-plus" size="small" onClick={onAddClick} />
        )}

        {onImportClick && (
          <Button
            label="Import Excel"
            icon="pi pi-upload"
            severity="success"
            size="small"
            onClick={onImportClick}
          />
        )}
      </div>
    </div>
  );
};

export default HeaderBar;
