# DNA Nexus Line Finder

## Description
The DNA Nexus Line Finder is a command-line tool that efficiently finds specific lines within large text files using an index file.

## Installation

1. **Prerequisites**
   - Node.js (v14 or later)
   - npm or yarn

## Usage

### Command-Line Syntax
```bash
node find_line.js PATH_TO_FILE LINE_NUMBER
```

- `PATH_TO_FILE`: The path to the file from which you want to retrieve a line.
- `LINE_NUMBER`: The line number you want to retrieve (0-indexed).

### Example
To retrieve the 5th line from a file named `data.txt`, you would run:
```bash
node find_line.js data.txt 2
```

### Notes
- Line numbers are 0-indexed, which means that line 1 is represented as `0`, line 2 as `1`, and so on.
- The tool will create an index file named `PATH_TO_FILE.idx` in the same directory as your target file. This index file is used to speed up subsequent line retrievals.

## TODO
1. Improve Error Handling:
    - Handle edge cases such as non-existent files, invalid line numbers, and corrupted index files.
    - Provide more informative error messages.
2. Efficient Offset Storage:
    - Consider using binary formats or databases for storing offsets instead of JSON for better performance with large files.
    - Implement compression techniques for the index file to save space.
3. Index Building Optimization:
    - Terminate index building sooner if the desired line has been found.
4. Performance Improvements:
    - Use stream to read the index file.
5. Testing and Validation:
    - Write unit tests to ensure the correctness of each function.
    - Use a code coverage tool to ensure all code paths are tested.
    - Validate edge cases and ensure the tool handles them gracefully.
