import { Pair, Scalar, YAMLMap, isScalar } from "yaml";

import { DiagnosticSeverity } from "vscode-languageserver";
import { SemanticTokenType } from "../../../../service/semanticTokens";
import { DiagnosticCode } from "../../../../utils/diagnostics";
import { HoverInfo } from "../../../../utils/hover";
import { LocationLinkOffset } from "../../../../utils/location";
import { isStringScalar } from "../../../../utils/yaml";
import { ConversationPlayerOptionType } from "../../../node";
import { AbstractNodeV1 } from "../../../v1";
import { Conversation } from "../Conversation";
import { Conditions } from "./Player/Conditions";
import { Events } from "./Player/Events";
import { Pointers } from "./Player/Pointers";
import { Text } from "./Player/Text";

export class PlayerOption extends AbstractNodeV1<ConversationPlayerOptionType> {
  readonly type: ConversationPlayerOptionType = "ConversationPlayerOption";
  readonly offsetStart: number;
  readonly offsetEnd: number;
  readonly parent: Conversation;

  // Cache the parsed yaml document
  private yml: Pair<Scalar<string>, YAMLMap>;
  readonly id: string;
  readonly comment?: string;

  constructor(yml: Pair<Scalar<string>, YAMLMap>, parent: Conversation) {
    super();
    this.parent = parent;
    this.offsetStart = yml.key.range![0];
    this.offsetEnd = yml.value?.range![1] || yml.key.range![1];
    this.yml = yml;
    this.comment = yml.key.commentBefore?.split(/\n\n+/).slice(-1)[0] ?? undefined;

    // Parse ID
    this.id = this.yml.key.value;
    if (this.yml.key.range) {
      this.semanticTokens.push({
        offsetStart: this.yml.key.range[0],
        offsetEnd: this.yml.key.range[1],
        tokenType: SemanticTokenType.ConversationOptionPlayerID
      });
    }

    // Parse values
    this.yml.value?.items.forEach(pair => {
      if (isStringScalar(pair.key)) {
        switch (pair.key.value) {
          case "text":
            if (isStringScalar(pair.value) || pair.value instanceof YAMLMap) {
              this.addChild(new Text(pair.value, this));
            }
            break;
          case "pointer":
            // Throw warning diagnostics, change to "*s"
            this.addDiagnostic(
              [pair.key.range![0], pair.key.range![1]],
              `It should be renamed to "${pair.key.value}s"`,
              DiagnosticSeverity.Warning,
              DiagnosticCode.YamlKeyAlternativeNaming,
              [
                {
                  title: `Rename to "${pair.key.value}s"`,
                  text: `${pair.key.value}s`
                }
              ]
            );
          case "pointers":
            if (isScalar<string>(pair.value) && typeof pair.value.value === 'string') {
              this.addChild(new Pointers(pair.value, this));
            } else {
              // TODO
            }
            break;
          case "condition":
            // Throw warning diagnostics, change to "*s"
            this.addDiagnostic(
              [pair.key.range![0], pair.key.range![1]],
              `It should be renamed to "${pair.key.value}s"`,
              DiagnosticSeverity.Warning,
              DiagnosticCode.YamlKeyAlternativeNaming,
              [
                {
                  title: `Rename to "${pair.key.value}s"`,
                  text: `${pair.key.value}s`
                }
              ]
            );
          case "conditions":
            if (isScalar<string>(pair.value) && typeof pair.value.value === 'string') {
              this.addChild(new Conditions(pair.value, this));
            } else {
              // TODO
            }
            break;
          case "event":
            // Throw warning diagnostics, change to "*s"
            this.addDiagnostic(
              [pair.key.range![0], pair.key.range![1]],
              `It should be renamed to "${pair.key.value}s"`,
              DiagnosticSeverity.Warning,
              DiagnosticCode.YamlKeyAlternativeNaming,
              [
                {
                  title: `Rename to "${pair.key.value}s"`,
                  text: `${pair.key.value}s`
                }
              ]
            );
          case "events":
            if (isScalar<string>(pair.value) && typeof pair.value.value === 'string') {
              this.addChild(new Events(pair.value, this));
            } else {
              // TODO
            }
            break;
          default:
            this.addDiagnostic(
              [pair.key.range![0], pair.key.range![1]],
              `Unknown key "${pair.key.value}"`,
              DiagnosticSeverity.Warning,
              DiagnosticCode.YamlKeyUnknown
            );
            break;
        }
      }

      // TODO: throw diagnostics: incorrect yaml value
    });
    // TODO

    // ...
  }

  getPointers() {
    return this.getChildren<Pointers>('ConversationPointers');
  }

  getConditions() {
    return this.getChildren<Conditions>('ConversationConditions');
  }

  getEvents() {
    return this.getChildren<Events>('ConversationEvents');
  }

  getHoverInfo(offset: number): HoverInfo[] {
    const hoverInfo: HoverInfo[] = super.getHoverInfo(offset);
    if (offset < this.offsetStart || offset > this.offsetEnd) {
      return hoverInfo;
    }
    if (offset >= this.yml.key.range![0] && offset <= this.yml.key.range![1] && this.comment) {
      hoverInfo.push({
        content: this.comment,
        offset: [this.offsetStart, this.offsetEnd]
      });
    }
    return hoverInfo;
  }

  getDefinitions(offset: number, documentUri?: string | undefined): LocationLinkOffset[] {
    // TODO: create "Key" node and move it into the node.
    if (offset < this.yml.key.range![0] || offset > this.yml.key.range![1]) { // Should be removed when moved into "Key"
      return [];
    }
    // Return self so VSCode will show its References instead
    return [{
      originSelectionRange: [this.yml.key.range![0], this.yml.key.range![1]],
      targetUri: this.getUri(),
      targetRange: [this.offsetStart, this.offsetEnd],
      targetSelectionRange: [this.yml.key.range![0], this.yml.key.range![1]],
    }];
  }

  getReferences(offset: number, documentUri?: string | undefined): LocationLinkOffset[] {
    // TODO: create "Key" node and move it into the node.
    if (offset < this.yml.key.range![0] || offset > this.yml.key.range![1]) { // Should be removed when moved into "Key"
      return [];
    }
    return this.getConversationOptionPointers(
      "ConversationPlayerOption",
      this.id,
      this.parent.conversationID,
      this.getPackageUri()
    )
      .flatMap(n => ({
        originSelectionRange: [this.offsetStart, this.offsetEnd],
        targetUri: n.getUri(),
        targetRange: [n.offsetStart!, n.offsetEnd!],
        targetSelectionRange: [n.offsetStart!, n.offsetEnd!]
      }));
  }

}
