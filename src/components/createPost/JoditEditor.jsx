import React, { useRef } from "react";
import JoditEditor from "jodit-react";
import "./jodit-editor.css";

const JoditTextEditor = ({ value, onChange, tabIndex, onBlur, ...props }) => {
  const editor = useRef(null);

  return (
    <div className="jodit-editor-container">
      <JoditEditor
        ref={editor}
        value={undefined} // কন্ট্রোল না করা
        defaultValue={value} // initial content
        onBlur={(newContent) => onChange(newContent)}
        tabIndex={tabIndex || 1}
        {...props}
      />
    </div>
  );
};

export default JoditTextEditor;
