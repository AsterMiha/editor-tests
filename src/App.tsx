import "./App.css";

// Import React dependencies.
import React, { useState, useCallback } from "react";
// Import the Slate editor factory.
import {
  createEditor,
  Descendant,
  Transforms,
  Editor,
} from "slate";
// Import the Slate components and React plugin.
import { Slate, Editable, withReact, RenderElementProps } from "slate-react";
import { Exercise, Question, Solution } from "./react-app-env";

const initialValue: Descendant[] = [
  {
    type: "exercise",
    children: [
      {
        type: "question",
        children: [
          {
            type: "paragraph",
            children: [
              { type: "text", text: "What is the capital of Germany?" },
            ],
          },
        ],
      },
      {
        type: "solution",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "Paragraph 1" }],
          },
          {
            type: "paragraph",
            children: [{ type: "text", text: "Paragraph 2" }],
          },
        ],
      },
    ],
  },
  {
    type: "exercise",
    children: [
      {
        type: "question",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "Question2?" }],
          },
        ],
      },
      {
        type: "solution",
        children: [
          {
            type: "paragraph",
            children: [{ type: "text", text: "Paragraph 1" }],
          },
          {
            type: "paragraph",
            children: [{ type: "text", text: "Paragraph 2" }],
          },
        ],
      },
    ],
  },
];

const emptyQ: Question = {
  type: "question",
  children: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Question text?" }],
    },
  ],
};

const emptyS: Solution = {
  type: "solution",
  children: [
    {
      type: "paragraph",
      children: [{ type: "text", text: "Solution text" }],
    },
  ],
};

function App() {
  const [editor] = useState(() =>
    withHtml(withCustomNormalization(withReact(createEditor())))
  );

  const renderElement = useCallback((props: RenderElementProps) => {
    switch (props.element.type) {
      case "question":
        return (
          <div
            style={{
              border: "orange solid 1px",
              borderRadius: "2px",
              padding: "0.3em",
              marginBottom: "0.2em"
            }}
            {...props.attributes}
          >
            {" "}
            {props.children}{" "}
          </div>
        );
      case "exercise":
        return (
          <div
            style={{
              border: "blue solid 1px",
              borderRadius: "2px",
              padding: "0.3em",
            }}
            {...props.attributes}
          >
            {" "}
            {props.children}{" "}
          </div>
        );
      case "code":
        return (
          <pre {...props.attributes}>
            <code>{props.children}</code>
          </pre>
        );
      case "paragraph":
        return (
          <div
            style={{
              border: "pink solid 1px",
              borderRadius: "2px",
              padding: "0.3em",
              marginBottom: "0.2em"
            }}
            {...props.attributes}
          >
            {" "}
            {props.children}{" "}
          </div>
        );
      case "solution":
        return (
          <div
            style={{
              border: "green solid 1px",
              borderRadius: "2px",
              padding: "0.3em",
              marginBottom: "0.2em"
            }}
            {...props.attributes}
          >
            {" "}
            {props.children}{" "}
          </div>
        );
    }
  }, []);

  return (
    <div style={{padding: "2em"}}>
    <Slate editor={editor} value={initialValue}>
      <Editable renderElement={renderElement} />
    </Slate>
    </div>
  );
}

function addMissing(exercise: Exercise): [boolean, Exercise] {
  var question: Question = emptyQ;
  var solution: Solution = emptyS;
  var changed: boolean = false;

  // empty exercise
  if (exercise.children.length === 0)
    changed = true;

  // 1 missing field
  if (exercise.children.length === 1) {
    if (exercise.children[0].type === 'question') {
      question = exercise.children[0];
    } else {
      solution = exercise.children[0];
    }
    changed = true;
  }

  let newExercise: Exercise = {
    type: 'exercise',
    children: [question, solution],
  }

  return [changed, newExercise];
}

function prettyPrintEditor(elems: Descendant[], spacing=0) {
  for (let i=0; i<elems.length; i++) {
    const elem: Descendant = elems[i];
    const isTextNode = elem.type === 'text';
    let textContent = '';
    if (isTextNode) {
      textContent = elem.text;
    }
    console.log(Array(spacing + 1).join(" ") + "type: " + elems[i].type + ": " + textContent)
    if (!isTextNode)
      prettyPrintEditor(elem.children, spacing + 4)
  }
}

function withCustomNormalization(editor: Editor) {
  let { normalizeNode } = editor;

  editor.normalizeNode = ([entry, path]) => {
    if (path.length === 0) {
      console.log(editor.children.length);
      prettyPrintEditor(editor.children)

      console.log("___________");
      // Check that all elements are exercises
      for (let i = 0; i < editor.children.length; i++) {
        console.log("- " + i + ": " + editor.children[i].type);
        const element = editor.children[i];
        if (element.type === "exercise") {
          console.log(element.children.length);
          // Check exercise composition

          // Check for extra elements

          // Check for missing elements
          const [changed, newEx]: [boolean, Exercise] = addMissing(element);
          if (changed) {
            Transforms.removeNodes(editor, {at: [i]});
            Transforms.insertNodes(editor, newEx, {at: [i], select: true});
          }

        } else {
          // Remove unsuitable nodes
          // Wrap question and solution in exercise
        }
      }
      console.log("___________");
    }

    // Fall back to the original `normalizeNode` to enforce other constraints.
    return normalizeNode([entry, path]);
  };
  return editor;
}

function withHtml (editor: Editor) {
  const { insertData } = editor;

  editor.insertData = data => {
    const html = data.getData('text/html');
    console.log(html);

    if (html) {
      const parsed = new DOMParser().parseFromString(html, 'text/html');
      console.log(parsed); 
      const fragment = deserialize(parsed.body)
      // Transforms.insertFragment(editor, fragment)
      return
    }

    insertData(data)
  }

  return editor
}

function deserialize(el: ChildNode) {
  // if (el.nodeType === 3) {
  //   return el.textContent
  // } else if (el.nodeType !== 1) {
  //   return null
  // } else if (el.nodeName === 'BR') {
  //   return '\n'
  // }

  // const { nodeName } = el;
  let parent = el;

  // if (
  //   nodeName === 'PRE' &&
  //   el.childNodes[0] &&
  //   el.childNodes[0].nodeName === 'CODE'
  // ) {
  //   parent = el.childNodes[0]
  // }
  let children: ChildNode[] = Array.from(parent.childNodes)
    .map(deserialize)
    .flat();

  // if (children.length === 0) {
  //   children = [{ text: '' }]
  // }

  // if (el.nodeName === 'BODY') {
  //   return jsx('fragment', {}, children)
  // }

  // if (ELEMENT_TAGS[nodeName]) {
  //   const attrs = ELEMENT_TAGS[nodeName](el)
  //   return jsx('element', attrs, children)
  // }

  // if (TEXT_TAGS[nodeName]) {
  //   const attrs = TEXT_TAGS[nodeName](el)
  //   return children.map(child => jsx('text', attrs, child))
  // }

  return children;
}

export default App;
