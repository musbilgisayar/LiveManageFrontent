"use client";

import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  MenuButtonBold,
  MenuButtonItalic,
  MenuControlsContainer,
  MenuDivider,
  MenuSelectHeading,
  RichTextEditorProvider,
  RichTextField,
  MenuButtonStrikethrough,
  MenuButtonOrderedList,
  MenuButtonBulletedList,
  MenuButtonBlockquote,
  MenuButtonCode,
  MenuButtonHorizontalRule,
  MenuButtonUndo,
  MenuButtonRedo,
  MenuButtonRemoveFormatting,
} from "mui-tiptap";
import "./Tiptap.css";

interface TiptapEditorProps {
  value?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({
  value = "",
  onChange,
  placeholder = "",
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: placeholder,
      }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
    },
  });

  return (
    <RichTextEditorProvider editor={editor}>
      <RichTextField
        controls={
          <MenuControlsContainer>
            <MenuSelectHeading />
            <MenuDivider />
            <MenuButtonBold />
            <MenuButtonItalic />
            <MenuButtonStrikethrough />
            <MenuDivider />
            <MenuButtonOrderedList />
            <MenuButtonBulletedList />
            <MenuDivider />
            <MenuButtonBlockquote />
            <MenuButtonCode />
            <MenuButtonHorizontalRule />
            <MenuDivider />
            <MenuButtonUndo />
            <MenuButtonRedo />
            <MenuDivider />
            <MenuButtonRemoveFormatting />
          </MenuControlsContainer>
        }
      />
    </RichTextEditorProvider>
  );
};

export default TiptapEditor;

/*"use client";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
    MenuButtonBold,
    MenuButtonItalic,
    MenuControlsContainer,
    MenuDivider,
    MenuSelectHeading,
    RichTextEditorProvider,
    RichTextField,
    MenuButtonStrikethrough,
    MenuButtonOrderedList,
    MenuButtonBulletedList,
    MenuButtonBlockquote,
    MenuButtonCode,
    MenuButtonHorizontalRule,
    MenuButtonUndo,
    MenuButtonRedo,
    MenuButtonRemoveFormatting,
} from "mui-tiptap";
import './Tiptap.css';
const TiptapEditor = () => {

    const editor = useEditor({
        extensions: [StarterKit],
        content: "<p>Type here...</p>",
    });
    return (
        <RichTextEditorProvider editor={editor} >
            <RichTextField
                controls={
                    <MenuControlsContainer>
                        <MenuSelectHeading />
                        <MenuDivider />
                        <MenuButtonBold />
                        <MenuButtonItalic />

                        <MenuButtonStrikethrough />
                        <MenuDivider />

                        <MenuButtonOrderedList />
                        <MenuButtonBulletedList />
                        <MenuDivider />
                        <MenuButtonBlockquote />
                        <MenuButtonCode />
                        <MenuButtonHorizontalRule />
                        <MenuDivider />

                        <MenuButtonUndo />
                        <MenuButtonRedo />
                        <MenuDivider />

                        <MenuButtonRemoveFormatting />

                    </MenuControlsContainer>
                }

            />
        </RichTextEditorProvider>
    );
};
export default TiptapEditor;
*/