
what do we event want here?

* using a cli, run commands from within the root directory of a matry project
* the cli should manage everything a developer needs to parse matry code
* but what does a developer need?

1. produce images and other assets from source
2. parse the code to a json output
3. render the json with passed-in variant values

we need a tree in several states:

1. ast (this is what tree-sitter produces)
2. syntax tree (this creates an adjacency list but does not resolve any expressions or take any parameters)
3. bundle (this is a directory of all assets (images, fonts, etc), as well as the json syntax tree)
4. render (this takes in a number of parameters to produce a final build against a target)

or does the bundle come after the render?
does a render result in a bundle?

I need to get very precise on my language.

Backing up, the designer needs to be able to...

1. Create multiple versions of the same tokens, with different parameters passed in. this is what I'm calling a "render."
2. Automatically generate a page or website that documents the tokens. This should include the expressions (calculations) that were used to create the tokens, along with their default values.


