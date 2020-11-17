# yaml-parser
A yaml parser which converts yaml file to ast. It is very similar to JS-YAML/YAML-AST-PARSER which supports parsing of YAML into AST with some additional features:

* trying to correct errors during parsing, eg the yaml `foo:bar` will be fixed as `foo: bar`
* including comment/tag/colon/block start indicator/document start&end

## Example
It will convert the following yaml to ast:
<pre>
foo:
   key1: [1, 2]
   key2: "test"
   key3:
     - a
     - b
 </pre>

<pre>[foo] :
    [key1] :
        [-] :
          [SCALAR] 1
          [SCALAR] 2
    [key2] :
        [SCALAR] "test"
    [key3] :
        [-] :
          [SCALAR] a
          [SCALAR] b</pre>

## Local Development
The whole project is written in javascript@es6, please refer to `https://babeljs.io/` if you have any difficulties about babel. Use `npm run build` to convert them into old javascript style which may be more friendly to old node.js versions.


