## j-Selected

The component can set a specific class to a specific element according to the simple condition.

__Configuration__:

Example: `data-jc-config="class:selected;selector:a"`

- `class` {String} is a class name for selected element (default: `selected`)
- `selector` {String} is a jQuery selector (default: `a`)
- `attr` {String} attribute for comparing (default: `if` and it means `data-if`)
- `datasource` {String} a path to data-source for list of items

__Usage__:

Each nested element according to the `selector` must have defined `data-if` attribute. It works only with `strings` values.

### Author

- Peter Širka <petersirka@gmail.com>
- [License](https://www.totaljs.com/license/)