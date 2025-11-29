import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { Compartment, EditorState } from '@codemirror/state';
import { getIndentUnit, indentUnit } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { javascript } from '@codemirror/lang-javascript';
import { css } from '@codemirror/lang-css';
import { cpp } from '@codemirror/lang-cpp';

import { foldableIndentationGuides } from '../src';

const pythonDoc = `def read_file(path):
  with open(path, 'r') as file:
  
    print("opening file")
    text = file.read()
    
    file.close()
    
    if len(text) > 1000:
      print("thats a big file!")
      
    return text

def main():
  read_file("notes.txt")
`;

const jsDoc = `import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { Compartment, EditorState } from '@codemirror/state';
import { getIndentUnit, indentUnit } from '@codemirror/language';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';

import { foldableIndentationGuides } from '../src';

const jsDoc = "";

const indentConf = new Compartment();

const view = new EditorView({
  state: EditorState.create({
    doc: jsDoc,
    extensions: [
      basicSetup,
      // python(),
      javascript(),
      indentConf.of(indentUnit.of('  ')),
      foldableIndentationGuides(),
    ],
  }),
  parent: document.getElementById('editor')!,
});

function toggleIndent() {
  const indent = getIndentUnit(view.state) === 2 ? '    ' : '  ';
  view.dispatch({ effects: indentConf.reconfigure(indentUnit.of(indent)) });
}

document
  .getElementById('toggleIndent')!
  .addEventListener('click', toggleIndent);
`;

const htmlDoc = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CodeMirror Foldable Indentation Guides</title>
  </head>
  <body>
    <button id="toggleIndent">Toggle indent size between 2 and 4</button>
    <div id="editor"></div>
    <script type="module" src="./index.ts"></script>
  </body>
</html>
`;

const cssDoc = `
body {
  background: #4385c7;
  color: #fff;
}

.cm-editor {
  font-size: 14px;
  font-family: monospace;
  background: #4385c7;
  color: #fff;
}
`;

const cppDoc = `#include <iostream>
#include <cmath>
#include <stdexcept>

struct Vec2 {
    double x = 0.0;
    double y = 0.0;

    Vec2() = default;
    Vec2(double x, double y) : x(x), y(y) {}

    double length() const {
        return std::sqrt(x * x + y * y);
    }

    Vec2 normalized() const {
        double len = length();
        if (len == 0.0) throw std::runtime_error("Cannot normalize zero vector");
        return Vec2(x / len, y / len);
    }

    double dot(const Vec2 &o) const {
        return x * o.x + y * o.y;
    }

    double distance_to(const Vec2 &o) const {
        double dx = x - o.x;
        double dy = y - o.y;
        return std::sqrt(dx * dx + dy * dy);
    }

    Vec2 operator+(const Vec2 &o) const {
        return Vec2(x + o.x, y + o.y);
    }

    Vec2 operator-(const Vec2 &o) const {
        return Vec2(x - o.x, y - o.y);
    }

    Vec2 operator*(double s) const {
        return Vec2(x * s, y * s);
    }

    Vec2 &operator+=(const Vec2 &o) {
        x += o.x; y += o.y;
        return *this;
    }

    Vec2 &operator-=(const Vec2 &o) {
        x -= o.x; y -= o.y;
        return *this;
    }

    Vec2 &operator*=(double s) {
        x *= s; y *= s;
        return *this;
    }
};

std::ostream &operator<<(std::ostream &os, const Vec2 &v) {
    return os << "(" << v.x << ", " << v.y << ")";
}

int main() {
    Vec2 a(3.0, 4.0);
    Vec2 b(1.0, -2.0);

    std::cout << "a = " << a << "\\n";
    std::cout << "b = " << b << "\\n";

    std::cout << "a + b = " << (a + b) << "\\n";
    std::cout << "a - b = " << (a - b) << "\\n";
    std::cout << "a * 2 = " << (a * 2.0) << "\\n";

    std::cout << "dot(a, b) = " << a.dot(b) << "\\n";
    std::cout << "distance(a, b) = " << a.distance_to(b) << "\\n";

    std::cout << "normalized(a) = " << a.normalized() << "\\n";

    return 0;
}
`;

const indentConf = new Compartment();

const view = new EditorView({
  state: EditorState.create({
    doc: cppDoc,
    extensions: [
      basicSetup,
      cpp(),
      // css(),
      // html(),
      // python(),
      // javascript(),
      indentConf.of(indentUnit.of('  ')),
      foldableIndentationGuides({
        additionalPadding: 4,
        highlightActiveMarker: true,
        highlightActiveBlockBackground: true,
        highlightHoveredBlockBackground: true,
        highlightHoveredMarker: true,
        colors: {
          activeLight: 'red',
          light: '#4385c780',
          backgroundLight: '#4385c720',
          backgroundHoverLight: '#ce701180',
        },
      }),
    ],
  }),
  parent: document.getElementById('editor')!,
});

function toggleIndent() {
  const indent = getIndentUnit(view.state) === 2 ? '    ' : '  ';
  view.dispatch({ effects: indentConf.reconfigure(indentUnit.of(indent)) });
}

document
  .getElementById('toggleIndent')!
  .addEventListener('click', toggleIndent);
