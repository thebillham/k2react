import React from "react";

import { Editor } from "react-draft-wysiwyg";
import "./react-draft-wysiwyg.css";

import Jimp from "jimp";

function uploadImageCallBack(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); // eslint-disable-line no-undef
    reader.onload = e => {
      let stream = e.target.result.replace(/^data:image\/\w+;base64,/, "");
      Jimp.read(Buffer.from(stream, "base64")).then(image => {
        //console.log("Width is " + image.bitmap.width);
        let width = image.bitmap.width < 500 ? image.bitmap.width : 500;
        image.resize(width, Jimp.AUTO, (err, image) => {
          // .greyscale((err, image) => {
          image.getBase64(Jimp.AUTO, (err, data) => {
            resolve({ data: { link: data } });
          });
        });
      });
    };
    reader.onerror = e => reject(e);
    reader.readAsDataURL(file);
  });
}

function SimpleEditor(props) {
  return (
    <Editor
      spellCheck
      editorState={props.editorState}
      onEditorStateChange={props.onEditorStateChange}
      toolbar={{
        options: [
          "inline",
          "blockType",
          "fontSize",
          "list",
          "textAlign",
          "colorPicker",
          "link",
          "history"
        ],
        colorPicker: {
          colors: [
            "rgb(97,189,109)",
            "rgb(26,188,156)",
            "rgb(84,172,210)",
            "rgb(44,130,201)",
            "rgb(147,101,184)",
            "rgb(71,85,119)",
            "rgb(204,204,204)",
            "rgb(65,168,95)",
            "rgb(0,168,133)",
            "rgb(61,142,185)",
            "rgb(41,105,176)",
            "rgb(85,57,130)",
            "rgb(40,50,78)",
            "rgb(0,0,0)",
            "rgb(247,218,100)",
            "rgb(251,160,38)",
            "rgb(235,107,86)",
            "rgb(226,80,65)",
            "rgb(163,143,132)",
            "rgb(239,239,239)",
            "rgb(255,255,255)",
            "rgb(250,197,28)",
            "rgb(243,121,52)",
            "rgb(209,72,65)",
            "rgb(184,49,47)",
            "rgb(124,112,107)",
            "rgb(209,213,216)"
          ]
        }
      }}
      toolbarClassName="rdw-storybook-toolbar"
      wrapperClassName="rdw-storybook-wrapper"
      editorClassName="rdw-storybook-editor"
    />
  );
}

function RichEditor(props) {
  return (
    <Editor
      spellCheck
      editorState={props.editorState}
      onEditorStateChange={props.onEditorStateChange}
      toolbar={{
        options: [
          "inline",
          "blockType",
          "fontSize",
          "list",
          "textAlign",
          "colorPicker",
          "link",
          "embedded",
          "image",
          "history"
        ],
        colorPicker: {
          colors: [
            "rgb(97,189,109)",
            "rgb(26,188,156)",
            "rgb(84,172,210)",
            "rgb(44,130,201)",
            "rgb(147,101,184)",
            "rgb(71,85,119)",
            "rgb(204,204,204)",
            "rgb(65,168,95)",
            "rgb(0,168,133)",
            "rgb(61,142,185)",
            "rgb(41,105,176)",
            "rgb(85,57,130)",
            "rgb(40,50,78)",
            "rgb(0,0,0)",
            "rgb(247,218,100)",
            "rgb(251,160,38)",
            "rgb(235,107,86)",
            "rgb(226,80,65)",
            "rgb(163,143,132)",
            "rgb(239,239,239)",
            "rgb(255,255,255)",
            "rgb(250,197,28)",
            "rgb(243,121,52)",
            "rgb(209,72,65)",
            "rgb(184,49,47)",
            "rgb(124,112,107)",
            "rgb(209,213,216)"
          ]
        },
        embedded: {
          defaultSize: {
            height: "1132",
            width: "800"
          }
        },
        image: {
          uploadCallback: uploadImageCallBack,
          previewImage: true,
          inputAccept: "image/gif,image/jpeg,image/jpg,image/png,image/svg",
          alt: { present: true, mandatory: false },
          defaultSize: {
            height: "auto",
            width: "auto"
          }
        }
      }}
      toolbarClassName="rdw-storybook-toolbar"
      wrapperClassName="rdw-storybook-wrapper"
      editorClassName="rdw-storybook-editor"
    />
  );
}

export { RichEditor, SimpleEditor };
