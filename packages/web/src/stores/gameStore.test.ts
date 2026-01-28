import { Cell, GRID_SIZE, Sudoku, TOTAL_CELLS } from '@sudoecool/shared';
import { beforeEach, describe, expect, it } from "bun:test";
import { useGameStore } from './gameStore';
// Helper to get a clean initial grid state
const getInitialGrid = (): Cell[] => Array(TOTAL_CELLS).fill(null).map(() => ({
  conflicts: [],
  notes: [],
  value: null,
  given: false,
  error: false,
}));

describe('gameStore', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    useGameStore.setState(useGameStore.getInitialState());
  });

  it('should have correct initial state', () => {
    const state = useGameStore.getState();
    expect(state.grid.length).toBe(TOTAL_CELLS);
    expect(state.notesMode).toBe(false);
    expect(state.selectedIndex).toBe(null);
  });

  it('should load a puzzle correctly', () => {
     const mockPuzzle: Sudoku = {
       puzzle: '41--75-----53--7--2-36-81--7-9--25-1-3--9-47--2-1-7---6587--9-----26-8--1925---47',
         solution: '416975238985321764273648159769432581531896472824157396658714923347269815192583647',
         difficulty: 'easy',
     };
     useGameStore.getState().loadPuzzle(mockPuzzle);
     const state = useGameStore.getState();

     expect(state.grid[0].value).toBe(4);
     expect(state.grid[0].given).toBe(true);

     expect(state.grid[11].value).toBe(5);
     expect(state.grid[11].given).toBe(true);

     expect(state.grid[18].value).toBe(2);
     expect(state.grid[18].given).toBe(true);

     expect(state.grid[2].value).toBe(null);
     expect(state.grid[2].given).toBe(false);
   });

  it('should select a cell', () => {
    useGameStore.getState().selectCell(5);
    expect(useGameStore.getState().selectedIndex).toBe(5);

    // Should clamp values
    useGameStore.getState().selectCell(TOTAL_CELLS + 10);
    expect(useGameStore.getState().selectedIndex).toBe(TOTAL_CELLS - 1);
    useGameStore.getState().selectCell(-10);
    expect(useGameStore.getState().selectedIndex).toBe(0);
  });

  it('should unselect a cell', () => {
    useGameStore.getState().selectCell(5);
    useGameStore.getState().unselectCell();
    expect(useGameStore.getState().selectedIndex).toBe(null);
  });

  it('should set a cell value if it\'s not given', () => {
    const initialGrid = getInitialGrid();
    initialGrid[10].given = false;
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().setCellValue(10, 5);
    expect(useGameStore.getState().grid[10].value).toBe(5);
  });

  it('should not set a cell value if it\'s given', () => {
    const givenCellIndex = 10;
    const initialGrid = getInitialGrid();
    initialGrid[givenCellIndex].given = true;
    initialGrid[givenCellIndex].value = 1; // Pre-fill a given value
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().setCellValue(givenCellIndex, 5);
    expect(useGameStore.getState().grid[givenCellIndex].value).toBe(1); // Should remain 1
  });

  it('should clear a cell value', () => {
    const initialGrid = getInitialGrid();
    initialGrid[10].value = 5;
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().clearCell(10);
    expect(useGameStore.getState().grid[10].value).toBe(null);
  });

  it('should toggle notes mode', () => {
    expect(useGameStore.getState().notesMode).toBe(false);
    useGameStore.getState().toggleNotesMode();
    expect(useGameStore.getState().notesMode).toBe(true);
    useGameStore.getState().toggleNotesMode();
    expect(useGameStore.getState().notesMode).toBe(false);
  });

  it('should add a note to an empty cell', () => {
    const initialGrid = getInitialGrid();
    initialGrid[0].value = null; // Ensure cell is empty
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().toggleNote(0, 1);
    expect(useGameStore.getState().grid[0].notes.includes(1)).toBe(true);
  });

  it('should remove a note from a cell with notes', () => {
    const initialGrid = getInitialGrid();
    initialGrid[0].notes.push(1);
    initialGrid[0].value = null;
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().toggleNote(0, 1);
    expect(useGameStore.getState().grid[0].notes.includes(1)).toBe(false);
  });

  it('should remove notes from cell when setting value', () => {
    const initialGrid = getInitialGrid();

    initialGrid[0].notes = [1,2]
    initialGrid[0].value = null;
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().setCellValue(0, 1);

    expect(useGameStore.getState().grid[0].notes.includes(1)).toBe(false);
    expect(useGameStore.getState().grid[0].notes.includes(2)).toBe(false);
  })

  it('should not toggle note on a given cell', () => {
    const initialGrid = getInitialGrid();
    initialGrid[0].given = true;
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().toggleNote(0, 1);
    expect(useGameStore.getState().grid[0].notes.includes(1)).toBe(false);
  });

  it('should not toggle note on a filled cell', () => {
    const initialGrid = getInitialGrid();
    initialGrid[0].value = 5;
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().toggleNote(0, 1);
    expect(useGameStore.getState().grid[0].notes.includes(1)).toBe(false);
  });

  it('should clear a note from the same row when setting a value', () => {
    const initialGrid = getInitialGrid();
    initialGrid[0].value = null; // Cell (0,0)
    initialGrid[1].notes.push(5); // Cell (0,1)
    initialGrid[2].notes.push(5); // Cell (0,2)
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().setCellValue(0, 5); // Set cell (0,0) to 5
    expect(useGameStore.getState().grid[1].notes.includes(5)).toBe(false);
    expect(useGameStore.getState().grid[2].notes.includes(5)).toBe(false);
  });

  it('should clear a note from the same column when setting a value', () => {
    const initialGrid = getInitialGrid();
    initialGrid[0].value = null; // Cell (0,0)
    initialGrid[GRID_SIZE].notes.push(5); // Cell (1,0)
    initialGrid[GRID_SIZE * 2].notes.push(5); // Cell (2,0)
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().setCellValue(0, 5); // Set cell (0,0) to 5
    expect(useGameStore.getState().grid[GRID_SIZE].notes.includes(5)).toBe(false);
    expect(useGameStore.getState().grid[GRID_SIZE * 2].notes.includes(5)).toBe(false);
  });

  it('should clear a note from the same region when setting a value', () => {
    const initialGrid = getInitialGrid();
    initialGrid[0].value = null; // Cell (0,0)
    initialGrid[1].notes.push(5); // Cell (0,1)
    initialGrid[GRID_SIZE].notes.push(5); // Cell (1,0)
    initialGrid[GRID_SIZE + 1].notes.push(5); // Cell (1,1)
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().setCellValue(0, 5); // Set cell (0,0) to 5
    expect(useGameStore.getState().grid[1].notes.includes(5)).toBe(false);
    expect(useGameStore.getState().grid[GRID_SIZE].notes.includes(5)).toBe(false);
    expect(useGameStore.getState().grid[GRID_SIZE + 1].notes.includes(5)).toBe(false);
  });

  it('should detect conflicts when setting a value', () => {
    const initialGrid = getInitialGrid();
    initialGrid[0].value = 5; // Cell (0,0)
    initialGrid[1].value = null; // Cell (0,1)
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().setCellValue(1, 5); // Set cell (0,1) to 5
    const state = useGameStore.getState();
    expect(state.grid[0].error).toBe(true);
    expect(state.grid[0].conflicts).toContain(1);
    expect(state.grid[1].error).toBe(true);
    expect(state.grid[1].conflicts).toContain(0);
  });

  it('should clear conflicts when a conflicting value is removed', () => {
    const initialGrid = getInitialGrid();
    initialGrid[0].value = 5; // Cell (0,0)
    initialGrid[1].value = 5; // Cell (0,1)
    initialGrid[0].error = true;
    initialGrid[0].conflicts = [1];
    initialGrid[1].error = true;
    initialGrid[1].conflicts = [0];
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().clearCell(1); // Clear cell (0,1)
    const state = useGameStore.getState();
    expect(state.grid[0].error).toBe(false);
    expect(state.grid[0].conflicts).toEqual([]);
    expect(state.grid[1].error).toBe(false);
    expect(state.grid[1].conflicts).toEqual([]);
  });

  it('should clear notes in a row via clearRowOfNote', () => {
    const initialGrid = getInitialGrid();
    initialGrid[0].notes.push(1);
    initialGrid[1].notes.push(1);
    initialGrid[2].notes.push(1);
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().clearRowOfNote(0, 1, -1); // Clear note 1 from row 0, -1 is dummy index
    const state = useGameStore.getState();
    expect(state.grid[0].notes.includes(1)).toBe(false);
    expect(state.grid[1].notes.includes(1)).toBe(false);
    expect(state.grid[2].notes.includes(1)).toBe(false);
  });

  it('should clear notes in a column via clearColOfNote', () => {
    const initialGrid = getInitialGrid();
    initialGrid[0].notes.push(1);
    initialGrid[GRID_SIZE].notes.push(1);
    initialGrid[GRID_SIZE * 2].notes.push(1);
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().clearColOfNote(0, 1, -1); // Clear note 1 from col 0, -1 is dummy index
    const state = useGameStore.getState();
    expect(state.grid[0].notes.includes(1)).toBe(false);
    expect(state.grid[GRID_SIZE].notes.includes(1)).toBe(false);
    expect(state.grid[GRID_SIZE * 2].notes.includes(1)).toBe(false);
  });

  it('should clear notes in a region via clearRegionOfNote', () => {
    const initialGrid = getInitialGrid();
    initialGrid[0].notes.push(1); // (0,0)
    initialGrid[1].notes.push(1); // (0,1)
    initialGrid[GRID_SIZE].notes.push(1); // (1,0)
    initialGrid[GRID_SIZE + 1].notes.push(1); // (1,1)
    useGameStore.setState({ grid: initialGrid });

    useGameStore.getState().clearRegionOfNote({ row: 0, col: 0 }, 1, -1); // Clear note 1 from region 0,0, -1 is dummy index
    const state = useGameStore.getState();
    expect(state.grid[0].notes.includes(1)).toBe(false);
    expect(state.grid[1].notes.includes(1)).toBe(false);
    expect(state.grid[GRID_SIZE].notes.includes(1)).toBe(false);
    expect(state.grid[GRID_SIZE + 1].notes.includes(1)).toBe(false);
  });
});
