// import Html from 'slate-html-serializer'
// import { Editor, getEventTransfer, getEventRange, } from 'slate-react'
// import { Block, Value } from 'slate'
//
// import React from 'react'
// import initialValue from './default.json'
// import { isKeyHotkey } from 'is-hotkey'
// import imageExtensions from 'image-extensions'
// import isUrl from 'is-url'
// import { convertFromHTML } from './deserialize'
// import { Button, Icon, Toolbar, Image } from './components'
//
// /**
//  * Define the default node type.
//  *
//  * @type {String}
//  */
//
// const DEFAULT_NODE = 'paragraph'
//
// /**
//  * Define hotkey matchers.
//  *
//  * @type {Function}
//  */
//
// const isBoldHotkey = isKeyHotkey('mod+b')
// const isItalicHotkey = isKeyHotkey('mod+i')
// const isUnderlinedHotkey = isKeyHotkey('mod+u')
// const isCodeHotkey = isKeyHotkey('mod+`')
//
// /*
//  * A function to determine whether a URL has an image extension.
//  *
//  * @param {String} url
//  * @return {Boolean}
//  */
//
// function isImage(url) {
//   return !!imageExtensions.find(url.endsWith)
// }
//
// /**
//  * A change function to standardize inserting images.
//  *
//  * @param {Editor} editor
//  * @param {String} src
//  * @param {Range} target
//  */
//
//  function insertImage(editor, src, target) {
//    if (target) {
//      editor.select(target)
//    }
//
//    editor.insertBlock({
//      type: 'image',
//      data: { src },
//    })
//  }
//
//
// /**
// * The editor's schema.
// *
// * @type {Object}
// */
//
//
// const schema = {
//   document: {
//     last: { type: 'paragraph' },
//     normalize: (editor, { code, node, child }) => {
//       switch (code) {
//         case 'last_child_type_invalid': {
//           const paragraph = Block.create('paragraph')
//           return editor.insertNodeByKey(node.key, node.nodes.size, paragraph)
//         }
//       }
//     },
//   },
//   blocks: {
//     image: {
//       isVoid: true,
//     },
//   },
// }
//
// /**
//  * Tags to blocks.
//  *
//  * @type {Object}
//  */
//
// const BLOCK_TAGS = {
//   p: 'paragraph',
//   li: 'list-item',
//   ul: 'bulleted-list',
//   ol: 'numbered-list',
//   blockquote: 'quote',
//   pre: 'code',
//   h1: 'heading-one',
//   h2: 'heading-two',
//   h3: 'heading-three',
//   h4: 'heading-four',
//   h5: 'heading-five',
//   h6: 'heading-six',
// }
//
// /**
//  * Tags to marks.
//  *
//  * @type {Object}
//  */
//
// const MARK_TAGS = {
//   strong: 'bold',
//   em: 'italic',
//   u: 'underline',
//   s: 'strikethrough',
//   code: 'code',
// }
//
// /**
//  * Serializer rules.
//  *
//  * @type {Array}
//  */
//
// const RULES = [
//   {
//     deserialize(el, next) {
//       const block = BLOCK_TAGS[el.tagName.toLowerCase()]
//
//       if (block) {
//         return {
//           object: 'block',
//           type: block,
//           nodes: next(el.childNodes),
//         }
//       }
//     },
//   },
//   {
//     deserialize(el, next) {
//       const mark = MARK_TAGS[el.tagName.toLowerCase()]
//
//       if (mark) {
//         return {
//           object: 'mark',
//           type: mark,
//           nodes: next(el.childNodes),
//         }
//       }
//     },
//   },
//   {
//     // Special case for code blocks, which need to grab the nested childNodes.
//     deserialize(el, next) {
//       if (el.tagName.toLowerCase() == 'pre') {
//         const code = el.childNodes[0]
//         const childNodes =
//           code && code.tagName.toLowerCase() == 'code'
//             ? code.childNodes
//             : el.childNodes
//
//         return {
//           object: 'block',
//           type: 'code',
//           nodes: next(childNodes),
//         }
//       }
//     },
//   },
//   {
//     // Special case for images, to grab their src.
//     deserialize(el, next) {
//       if (el.tagName.toLowerCase() == 'img') {
//         return {
//           object: 'block',
//           type: 'image',
//           nodes: next(el.childNodes),
//           data: {
//             src: el.getAttribute('src'),
//           },
//         }
//       }
//     },
//   },
//   {
//     // Special case for links, to grab their href.
//     deserialize(el, next) {
//       if (el.tagName.toLowerCase() == 'a') {
//         return {
//           object: 'inline',
//           type: 'link',
//           nodes: next(el.childNodes),
//           data: {
//             href: el.getAttribute('href'),
//           },
//         }
//       }
//     },
//   },
// ]
//
// /**
//  * Create a new HTML serializer with `RULES`.
//  *
//  * @type {Html}
//  */
//  // TODO add in deserialize.js
//
// const serializer = new Html({ rules: RULES })
//
// /**
//  * The Editor
//  *
//  * @type {Component}
//  */
//
// class SlateEditor extends React.Component {
//   /**
//    * Deserialize the initial editor value.
//    *
//    * @type {Object}
//    */
//
//   state = {
//     value: Value.fromJSON(initialValue),
//   }
//
//
//   /**
//    * Check if the current selection has a mark with `type` in it.
//    *
//    * @param {String} type
//    * @return {Boolean}
//    */
//
//   hasMark = type => {
//     const { value } = this.state
//     return value.activeMarks.some(mark => mark.type == type)
//   }
//
//   /**
//    * Check if the any of the currently selected blocks are of `type`.
//    *
//    * @param {String} type
//    * @return {Boolean}
//    */
//
//   hasBlock = type => {
//     const { value } = this.state
//     return value.blocks.some(node => node.type == type)
//   }
//
//   /**
//    * Store a reference to the `editor`.
//    *
//    * @param {Editor} editor
//    */
//
//   ref = editor => {
//     this.editor = editor
//   }
//
//   /**
//    * Render.
//    *
//    * @return {Element}
//    */
//
//   render() {
//     return (
//       <div>
//         <Toolbar>
//           {this.renderMarkButton('bold', 'format_bold')}
//           {this.renderMarkButton('italic', 'format_italic')}
//           {this.renderMarkButton('underlined', 'format_underlined')}
//           {this.renderMarkButton('code', 'code')}
//           {this.renderImageButton('image', 'image')}
//           {this.renderBlockButton('heading-one', 'looks_one')}
//           {this.renderBlockButton('heading-two', 'looks_two')}
//           {this.renderBlockButton('block-quote', 'format_quote')}
//           {this.renderBlockButton('numbered-list', 'format_list_numbered')}
//           {this.renderBlockButton('bulleted-list', 'format_list_bulleted')}
//         </Toolbar>
//
//         <Editor
//           spellCheck
//           autoFocus
//           placeholder="Enter some rich text..."
//           schema={this.schema}
//           ref={this.ref}
//           value={this.state.value}
//           onChange={this.onChange}
//           onKeyDown={this.onKeyDown}
//           onPaste={this.onPaste}
//           onDrop={this.onDrop}
//           renderNode={this.renderNode}
//           renderMark={this.renderMark}
//         />
//       </div>
//     )
//   }
//
//   /**
//    * Render a mark-toggling toolbar button.
//    *
//    * @param {String} type
//    * @param {String} icon
//    * @return {Element}
//    */
//
//   renderMarkButton = (type, icon) => {
//     const isActive = this.hasMark(type)
//
//     return (
//       <Button
//         active={isActive}
//         onMouseDown={event => this.onClickMark(event, type)}
//       >
//         <Icon icon={icon}/>
//       </Button>
//     )
//   }
//
//   /**
//    * Render a block-toggling toolbar button.
//    *
//    * @param {String} type
//    * @param {String} icon
//    * @return {Element}
//    */
//
//   renderBlockButton = (type, icon) => {
//     let isActive = this.hasBlock(type)
//
//     if (['numbered-list', 'bulleted-list'].includes(type)) {
//       const { value: { document, blocks } } = this.state
//
//       if (blocks.size > 0) {
//         const parent = document.getParent(blocks.first().key)
//         isActive = this.hasBlock('list-item') && parent && parent.type === type
//       }
//     }
//
//     return (
//       <Button
//         active={isActive}
//         onMouseDown={this.onClickImage}
//       >
//         <Icon icon={icon}/>
//       </Button>
//     )
//   }
//
//
//   /**
//    * Render a block-toggling toolbar button.
//    *
//    * @param {String} type
//    * @param {String} icon
//    * @return {Element}
//    */
//
//   renderImageButton = (type, icon) => {
//     let isActive = this.hasBlock(type)
//
//     return (
//       <Button
//         active={isActive}
//         onMouseDown={this.onClickImage}
//       >
//         <Icon icon={icon}/>
//       </Button>
//     )
//   }
//   /**
//    * Render a Slate node.
//    *
//    * @param {Object} props
//    * @return {Element}
//    */
//
//   renderNode = (props, editor, next) => {
//     const { attributes, children, node, isFocused } = props
//
//     switch (node.type) {
//       case 'block-quote':
//         return <blockquote {...attributes}>{children}</blockquote>
//       case 'code':
//         return (
//           <pre>
//             <code {...attributes}>{children}</code>
//           </pre>
//         )
//       case 'bulleted-list':
//         return <ul {...attributes}>{children}</ul>
//       case 'heading-one':
//         return <h1 {...attributes}>{children}</h1>
//       case 'heading-two':
//         return <h2 {...attributes}>{children}</h2>
//       case 'heading-three':
//         return <h3 {...attributes}>{children}</h3>
//       case 'heading-four':
//         return <h4 {...attributes}>{children}</h4>
//       case 'heading-five':
//         return <h5 {...attributes}>{children}</h5>
//       case 'heading-six':
//         return <h6 {...attributes}>{children}</h6>
//       case 'list-item':
//         return <li {...attributes}>{children}</li>
//       case 'numbered-list':
//         return <ol {...attributes}>{children}</ol>
//       case 'link': {
//         const { data } = node
//         const href = data.get('href')
//         return (
//           <a href={href} {...attributes}>
//             {children}
//           </a>
//         )
//       }
//       case 'image': {
//         const src = node.data.get('src')
//         return <Image src={src} selected={isFocused} {...attributes} />
//       }
//
//       default: {
//         return next()
//       }
//     }
//   }
//
//   /**
//    * Render a Slate mark.
//    *
//    * @param {Object} props
//    * @return {Element}
//    */
//
//   renderMark = (props, editor, next) => {
//     const { children, mark, attributes } = props
//
//     switch (mark.type) {
//       case 'bold':
//         return <strong {...attributes}>{children}</strong>
//       case 'code':
//         return <code {...attributes}>{children}</code>
//       case 'italic':
//         return <em {...attributes}>{children}</em>
//       case 'underlined':
//         return <u {...attributes}>{children}</u>
//       default:
//         return next()
//     }
//   }
//
//   /**
//    * On change, save the new `value`.
//    *
//    * @param {Editor} editor
//    */
//
//   onChange = ({ value }) => {
//     this.setState({ value })
//   }
//
//   onDropOrPaste = (event, editor, next) => {
//     const target = getEventRange(event, editor)
//     if (!target && event.type === 'drop') return next()
//
//     const transfer = getEventTransfer(event)
//     const { type, text, files } = transfer
//
//     if (type === 'files') {
//       for (const file of files) {
//         const reader = new FileReader()
//         const [mime] = file.type.split('/')
//         if (mime !== 'image') continue
//
//         reader.addEventListener('load', () => {
//           editor.command(insertImage, reader.result, target)
//         })
//
//         reader.readAsDataURL(file)
//       }
//       return
//     }
//
//     if (type === 'html') {
//       const { document } = serializer.deserialize(transfer.html)
//       editor.insertFragment(document)
//     }
//
//     if (type === 'text') {
//       if (!isUrl(text)) return next()
//       if (!isImage(text)) return next()
//       editor.command(insertImage, text, target)
//       return
//     }
//
//     next()
//   }
//
//   /**
//    * On key down, if it's a formatting command toggle a mark.
//    *
//    * @param {Event} event
//    * @param {Editor} editor
//    * @return {Change}
//    */
//
//   onKeyDown = (event, editor, next) => {
//     let mark
//
//     if (isBoldHotkey(event)) {
//       mark = 'bold'
//     } else if (isItalicHotkey(event)) {
//       mark = 'italic'
//     } else if (isUnderlinedHotkey(event)) {
//       mark = 'underlined'
//     } else if (isCodeHotkey(event)) {
//       mark = 'code'
//     } else {
//       return next()
//     }
//
//     event.preventDefault()
//     editor.toggleMark(mark)
//   }
//
//   /**
//    * When a mark button is clicked, toggle the current mark.
//    *
//    * @param {Event} event
//    * @param {String} type
//    */
//
//   onClickMark = (event, type) => {
//     event.preventDefault()
//     this.editor.toggleMark(type)
//   }
//
//   /**
//    * When a block button is clicked, toggle the block type.
//    *
//    * @param {Event} event
//    * @param {String} type
//    */
//
//   onClickBlock = (event, type) => {
//     event.preventDefault()
//
//     const { editor } = this
//     const { value } = editor
//     const { document } = value
//
//     // Handle everything but list buttons.
//     if (type != 'bulleted-list' && type != 'numbered-list') {
//       const isActive = this.hasBlock(type)
//       const isList = this.hasBlock('list-item')
//
//       if (isList) {
//         editor
//           .setBlocks(isActive ? DEFAULT_NODE : type)
//           .unwrapBlock('bulleted-list')
//           .unwrapBlock('numbered-list')
//       } else {
//         editor.setBlocks(isActive ? DEFAULT_NODE : type)
//       }
//     } else {
//       // Handle the extra wrapping required for list buttons.
//       const isList = this.hasBlock('list-item')
//       const isType = value.blocks.some(block => {
//         return !!document.getClosest(block.key, parent => parent.type == type)
//       })
//
//       if (isList && isType) {
//         editor
//           .setBlocks(DEFAULT_NODE)
//           .unwrapBlock('bulleted-list')
//           .unwrapBlock('numbered-list')
//       } else if (isList) {
//         editor
//           .unwrapBlock(
//             type == 'bulleted-list' ? 'numbered-list' : 'bulleted-list'
//           )
//           .wrapBlock(type)
//       } else {
//         editor.setBlocks('list-item').wrapBlock(type)
//       }
//     }
//   }
//
//   /**
//    * On clicking the image button, prompt for an image and insert it.
//    *
//    * @param {Event} event
//    */
//
//   onClickImage = event => {
//     event.preventDefault()
//     const src = window.prompt('Enter the URL of the image:')
//     if (!src) return
//     this.editor.command(insertImage, src)
//   }
// }
//
// /**
//  * Export.
//  */
//
// export default SlateEditor
