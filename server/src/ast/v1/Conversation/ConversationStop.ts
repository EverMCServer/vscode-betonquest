import { Scalar } from "yaml";
import { DiagnosticSeverity } from "vscode-languageserver";

import { ConversationStopType, AbstractNodeV1 } from "../../node";
import { Conversation } from "./Conversation";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";

export class ConversationStop extends AbstractNodeV1<ConversationStopType> {
  type: ConversationStopType = 'ConversationStop';
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent: Conversation;

  semanticTokens: SemanticToken[] = [];

  // Cache the parsed yaml document
  yml: Scalar;
  value?: boolean;

  constructor(yml: Scalar, parent: Conversation) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;

    this.offsetStart = yml.range?.[0];
    this.offsetEnd = yml.range?.[1];

    // Check YAML value type
    if (typeof this.yml.value === 'string') {
      // Parse string
      switch (this.yml.value.trim().toLowerCase()) {
        case 'true':
          this.value = true;
          break;
        case 'false':
          this.value = false;
          break;
        case '':
          // Not set, keep it undefined
          break;
        default:
          // Incorecct value, throw diagnostics warning + quick actions
          this._addDiagnosticValueTypeIncorrect();
          break;
      }

      // Add Semantic Tokens
      this.semanticTokens.push({
        offsetStart: this.offsetStart!,
        offsetEnd: this.offsetEnd!,
        tokenType: SemanticTokenType.Boolean
      });
    } else if (typeof this.yml.value === 'boolean') {
      this.value = this.yml.value;

      // Add Semantic Tokens
      this.semanticTokens.push({
        offsetStart: this.offsetStart!,
        offsetEnd: this.offsetEnd!,
        tokenType: SemanticTokenType.Boolean
      });
    } else if (this.yml.value === null) {
    } else {
      // Incorecct value, throw diagnostics warning + quick actions
      this._addDiagnosticValueTypeIncorrect();
    }
  }

  private _addDiagnosticValueTypeIncorrect() {
    this.addDiagnostic(
      [this.offsetStart!, this.offsetEnd!],
      `Incorrect value "${this.yml.value}"`,
      DiagnosticSeverity.Error,
      DiagnosticCode.ValueContentIncorrect,
      [
        {
          title: `Remove value`,
          text: `""`
        },
        {
          title: `Change value to "true"`,
          text: "true"
        },
        {
          title: `Change value to "false"`,
          text: "false"
        }
      ]
    );
  }

  getSemanticTokens(): SemanticToken[] {
    const semanticTokens: SemanticToken[] = this.semanticTokens;
    return semanticTokens;
  };
}