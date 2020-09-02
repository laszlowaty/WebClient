declare module "selection-range" {
  type SelectionInfo = {
    start: number,
    end?: number,
    atStart?: boolean,
  }

  export default function(el: HTMLElement): SelectionInfo;
  export default function(el: HTMLElement, position: SelectionInfo): SelectionInfo;
};