import { Scalar } from "yaml";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationEventsType, ConversationOptionType, NodeV1 } from "../../../node";
import { DiagnosticCode } from "../../../../utils/diagnostics";
import { LocationLinkOffset } from "../../../../utils/location";
import { getScalarSourceAndRange } from "../../../../utils/yaml";
import { Event } from "./Event";

export class Events<PT extends NodeV1<ConversationOptionType>> extends NodeV1<ConversationEventsType> {
  type: ConversationEventsType = "ConversationEvents";
  protected uri: string;
  protected parent: PT;

  private yml: Scalar<string>; //<Scalar<string>, Scalar<string>>;
  private eventsStr: string;
  private events: Event<this>[] = [];

  constructor(yml: Scalar<string>, parent: PT) {
    super();
    this.uri = parent.getUri();
    this.parent = parent;

    this.yml = yml;
    [this.eventsStr, [this.offsetStart, this.offsetEnd]] = getScalarSourceAndRange(this.yml);

    // Split and parse Event IDs
    const regex = /(,?)([^,]*)/g; // /(,?)([^,]*)/g
    let matched: RegExpExecArray | null;
    while ((matched = regex.exec(this.eventsStr)) !== null && matched[0].length > 0) {
      const str = matched[2];
      const offsetStartWithComma = this.offsetStart + matched.index;
      const offsetStart = offsetStartWithComma + matched[1].length;
      const offsetEnd = offsetStart + str.length;
      const strTrimedStart = str.trimStart();
      const strTrimed = strTrimedStart.trimEnd();
      const offsetStartTrimed = offsetStart + (str.length - strTrimedStart.length);
      const offsetEndTrimed = offsetStartTrimed + strTrimed.length;

      if (strTrimed.length === 0) {
        // Empty, throw diagnostics warn
        this.addDiagnostic(
          [offsetStartWithComma, offsetEnd],
          `Event ID is empty.`,
          DiagnosticSeverity.Warning,
          DiagnosticCode.ElementIdEmpty,
          [
            {
              title: `Remove empty Event ID`,
              text: "",
            }
          ]
        );
      }

      // Parse the Event ID
      this.events.push(new Event(strTrimed, [offsetStartTrimed, offsetEndTrimed], this));

    }
  }

  getDiagnostics(): Diagnostic[] {
    return [
      ...this.diagnostics,
      ...this.events.flatMap(c => c.getDiagnostics())
    ];
  }

  getDefinitions(offset: number): LocationLinkOffset[] {
    if (this.offsetStart! > offset || this.offsetEnd! < offset) {
      return [];
    }

    return this.events.flatMap(c => c.getDefinitions(offset));
  }
}