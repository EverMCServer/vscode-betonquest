import { ElementKind } from "betonquest-utils/betonquest/v1/Element";
import Event from "betonquest-utils/betonquest/Event";
import { EventKindType, Node } from "../../node";
import { EventEntry } from "./EventEntry";
import { HoverInfo } from "../../../utils/hover";

export class EventKind implements Node<EventKindType> {
  type: EventKindType = "EventKind";
  uri?: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: EventEntry;

  value: string;
  kindConfig?: ElementKind<Event>;

  constructor(value: string, range: [number?, number?], kindConfig?: ElementKind<Event>, parent?: EventEntry) {
    this.uri = parent?.uri;
    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.parent = parent;

    this.value = value;
    this.kindConfig = kindConfig;
  }

  getHoverInfo(uri: string, offset: number): HoverInfo[] {
    const infos: HoverInfo[] = [];
    if (this.offsetStart && this.offsetEnd && this.offsetStart <= offset && this.offsetEnd >= offset) {
      const info: HoverInfo = {
        content: "",
        offset: [this.offsetStart, this.offsetEnd]
      };
      if (this.kindConfig) {
        info.content = "(event) " + this.kindConfig?.value;
        if (this.kindConfig.description) {
          info.content += "\n\n---\n\n" + this.kindConfig.display.toString() + "\n\n" + this.kindConfig.description;
        }
      }
      infos.push(info);
    }
    return infos;
  }
}