import { Scalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationFinalEventsType, NodeV1 } from "../../node";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { LocationLinkOffset } from "../../../utils/location";
import { getScalarRangeByValue, getSourceByValue } from "../../../utils/yaml";
import { Conversation } from "./Conversation";
import { Event } from "./Option/Event";

export class ConversationFinalEvents extends NodeV1<ConversationFinalEventsType> {
  type: ConversationFinalEventsType = 'ConversationFinalEvents';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: Conversation;

  // Cache the parsed yaml document
  yml: Scalar;
  events: Event<this>[] = [];

  constructor(yml: Scalar, parent: Conversation) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;
    [this.offsetStart, this.offsetEnd] = getScalarRangeByValue(this.yml);

    const str = getSourceByValue(this.yml);
    // Check value type
    if (typeof str === 'string') {
      // Parse Events with RegEx
      const regex = /(,?)([^,]*)/g; // /([^\s,]+)/gm;
      let matched: RegExpExecArray | null;
      while ((matched = regex.exec(str)) !== null && matched[0].length > 0) {
        const str = matched[2];
        const strTrimed = str.trim();
        const offsetStartWithComma = this.offsetStart + matched.index;
        const offsetStart = offsetStartWithComma + matched[1].length;
        const offsetEnd = offsetStart + str.length;
        const rangeWithComma = this.parent.getRangeByOffset(offsetStartWithComma, offsetEnd);
        const range = this.parent.getRangeByOffset(offsetStart, offsetEnd);

        // Check leading & tailing empty spaces
        if (strTrimed !== str) {
          // Throw diagnostics & quick fix
          this._addDiagnostic(
            range,
            `Event IDs in "final_events" can not be separated with leading or tailing spaces.`,
            DiagnosticSeverity.Error,
            DiagnosticCode.ValueFormatIncorrect,
            [
              {
                title: "Remove leading & tailing empty spaces",
                text: strTrimed,
                range: range
              }
            ]
          );
        }

        // Check if any spaces in the middle
        if (strTrimed.match(/\s+/)) {
          const correctStr = strTrimed.replace(/\s+/g, "_");
          this._addDiagnostic(
            range,
            `Event ID cannot contains empty spaces. Do you mean "${correctStr}"?.`,
            DiagnosticSeverity.Error,
            DiagnosticCode.ElementIdSyntax,
            [
              {
                title: `Change to "${correctStr}"`,
                range: range,
                text: correctStr
              },
              {
                title: `Remove "${strTrimed}"`,
                range: rangeWithComma,
                text: ""
              }
            ]
          );
        }

        // Create Event
        this.events.push(
          new Event<this>(
            str,
            [offsetStart, offsetEnd],
            this
          )
        );
      }
    }
  }

  getDiagnostics() {
    const diagnostics = this.diagnostics;
    this.events.forEach(event => diagnostics.push(...event.getDiagnostics()));
    return diagnostics;
  }

  getCodeActions() {
    return this.codeActions;
  }

  getDefinitions(offset: number): LocationLinkOffset[] {
    if (this.offsetStart! > offset || this.offsetEnd! < offset) {
      return [];
    }

    return this.events.flatMap(c => c.getDefinitions(offset));
  }
}
