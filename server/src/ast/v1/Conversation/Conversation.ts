import { Pair, Scalar, isMap, isScalar } from "yaml";
import { DiagnosticSeverity, PublishDiagnosticsParams } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";

import { PackageV1 } from "../Package";
import { ConversationNpcOptionType, ConversationOptionType, ConversationPlayerOptionType, ConversationType } from "../../node";
import { isYamlMapPair } from "../../../utils/yaml";
import { DiagnosticCode } from "../../../utils/diagnostics";
import { LocationLinkOffset } from "../../../utils/location";
import { SemanticToken, SemanticTokenType } from "../../../service/semanticTokens";
import { HoverInfo } from "../../../utils/hover";
import { getFilename } from "../../../utils/url";
import { ConversationQuester } from "./ConversationQuester";
import { First } from "./First";
import { ConversationStop } from "./ConversationStop";
import { ConversationFinalEvents } from "./ConversationFinalEvents";
import { ConversationInterceptor } from "./ConversationInterceptor";
import { Document } from "../document";
import { Option } from "./Option/Option";

export class Conversation extends Document<ConversationType> {
  type: ConversationType = 'Conversation';

  // Contents
  conversationID: string;
  // quester?: ConversationQuester;
  // first?: First;
  // stop?: ConversationStop;
  // finalEvents?: ConversationFinalEvents;
  // interceptor?: ConversationInterceptor;
  // npcOptions: Option<ConversationNpcOptionType>[] = [];
  // playerOptions: Option<ConversationPlayerOptionType>[] = [];

  semanticTokens: SemanticToken[] = [];

  constructor(uri: string, document: TextDocument, parent: PackageV1) {
    super(uri, document, parent);
    this.conversationID = this.uri.match(/([^\/]+)\.yml$/m)![1];

    // Parse Elements
    this.yml.items.forEach(pair => {
      const offsetStart = pair.key.range?.[0] ?? 0;
      const offsetEnd = (pair.value as Scalar)?.range?.[1] ?? offsetStart;
      // Set key's Semantic Token
      if (pair.key.range) {
        switch (pair.key.value) {
          case "quester":
          case "first":
          case "stop":
          case "final_events":
          case "interceptor":
          case "NPC_options":
          case "player_options":
            this.semanticTokens.push({
              offsetStart: pair.key.range![0],
              offsetEnd: pair.key.range![1],
              tokenType: SemanticTokenType.ConversationKeyword
            });
        }
      }
      // Parse value
      switch (pair.key.value) {
        case "quester":
          if (isScalar(pair.value) || isMap<Scalar<string>>(pair.value)) {
            this.addChild(new ConversationQuester(pair.value, this));
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string or a translation list.`);
          }
          break;
        case "first":
          if (isScalar(pair.value)) {
            this.addChild(new First(pair.value, this));
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string.`);
          }
          break;
        case "stop":
          if (isScalar(pair.value)) {
            this.addChild(new ConversationStop(pair.value, this));
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string.`);
          }
          break;
        case "final_events":
          if (isScalar(pair.value)) {
            this.addChild(new ConversationFinalEvents(pair.value, this));
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string.`);
          }
          break;
        case "interceptor":
          if (isScalar(pair.value)) {
            this.addChild(new ConversationInterceptor(pair.value, this));
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type. It should be a string.`);
          }
          break;
        case "NPC_options":
          if (isYamlMapPair(pair) && pair.value) {
            pair.value.items.forEach(option => {
              // Check YAML value type
              if (isYamlMapPair(option) && option.value) {
                this.addChild(new Option("ConversationNpcOption", option, this));
              } else {
                // TODO: throw diagnostics error.
              }
            });
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type.`);
          }
          break;
        case "player_options":
          if (isYamlMapPair(pair) && pair.value) {
            pair.value.items.forEach(option => {
              // Check YAML value type
              if (isYamlMapPair(option) && option.value) {
                this.addChild(new Option("ConversationPlayerOption", option, this));
              } else {
                // TODO: throw diagnostics error.
              }
            });
          } else {
            // Throw incorrect value diagnostics
            this.addDiagnosticValueTypeIncorrect(pair, `Incorrect value type.`);
          }
          break;
        default:
          let correctKeyStr = pair.key.value.toLowerCase();
          switch (correctKeyStr) {
            case "npc_options":
              correctKeyStr = "NPC_options";
            case "quester":
            case "first":
            case "stop":
            case "final_events":
            case "interceptor":
            case "player_options":
              // Throw error diagnostics for incorrect keys
              this.addDiagnostic(
                [offsetStart, offsetEnd],
                `Incorrect key "${pair.key.value}". Do you mean "${correctKeyStr}"?`,
                DiagnosticSeverity.Warning,
                DiagnosticCode.YamlKeyUnknown,
                [{
                  title: `Rename key to "${correctKeyStr}"`,
                  text: correctKeyStr,
                  range: [pair.key.range![0], pair.key.range![1]],
                }]
              );
              break;
            default:
              // Throw warning diagnostics for unknown keys
              this.addDiagnostic(
                [offsetStart, offsetEnd],
                `Unknown key "${pair.key.value}"`,
                DiagnosticSeverity.Warning,
                DiagnosticCode.YamlKeyUnknown,
                [
                  {
                    title: `Remove "${pair.key.value}"`,
                    text: "",
                    range: [offsetStart, offsetEnd]
                  }
                ],
              );
              break;
          }
          break;
      }
    });

    // Check missing elements
    if (!this.getChild('ConversationFirst')) {
      this.addDiagnostic(
        [0, 0],
        `Missing element "quester".`,
        DiagnosticSeverity.Error,
        DiagnosticCode.ConversationMissingQuester,
        [
          {
            title: `Add element "quester"`,
            text: `quester: ${getFilename(this.document.uri, true)}\n`
          }
        ]
      );
    }

    // ...
  }

  private addDiagnosticValueTypeIncorrect(pair: Pair<Scalar<string>>, message: string) {
    const offsetStart = (pair.value as any).range?.[0] as number | undefined ?? pair.key.range?.[0];
    const offsetEnd = offsetStart ? (pair.value as any).range?.[1] as number : pair.key.range?.[1];
    this.addDiagnostic([offsetStart, offsetEnd], message, DiagnosticSeverity.Error, DiagnosticCode.ValueTypeIncorrect);
  }

  getPublishDiagnosticsParams(documentUri?: string) {
    if (documentUri && this.uri !== documentUri) {
      return [];
    }
    return {
      uri: this.uri,
      diagnostics: this.children.flatMap(c => c.getDiagnostics())
      // diagnostics: [
      //   ...this.diagnostics,
      //   ...this.quester?.getDiagnostics() ?? [],
      //   ...this.first?.getDiagnostics() ?? [],
      //   ...this.stop?.getDiagnostics() ?? [],
      //   ...this.finalEvents?.getDiagnostics() ?? [],
      //   ...this.interceptor?.getDiagnostics() ?? [],
      //   ...this.npcOptions?.flatMap(npc => npc.getDiagnostics()) ?? [],
      //   ...this.playerOptions?.flatMap(player => player.getDiagnostics()) ?? [],
      // ]
    } as PublishDiagnosticsParams;
  }

  // Get all CodeActions, quick fixes etc
  getCodeActions(documentUri?: string) {
    if (documentUri && this.uri !== documentUri) {
      return [];
    }
    return this.children.flatMap(c => c.getCodeActions());
    // return [
    //   ...this.codeActions,
    //   ...this.quester?.getCodeActions() ?? [],
    //   ...this.first?.getCodeActions() ?? [],
    //   ...this.stop?.getCodeActions() ?? [],
    //   ...this.finalEvents?.getCodeActions() ?? [],
    //   ...this.interceptor?.getCodeActions() ?? [],
    //   ...this.npcOptions?.flatMap(npc => npc.getCodeActions()) ?? [],
    //   ...this.playerOptions?.flatMap(player => player.getCodeActions()) ?? [],
    // ];
  }

  getSemanticTokens(documentUri: string): SemanticToken[] {
    if (documentUri !== this.uri) {
      return [];
    }
    return this.children.flatMap(c => c.getSemanticTokens());
    // const semanticTokens: SemanticToken[] = [];
    // semanticTokens.push(...this.semanticTokens);
    // semanticTokens.push(...this.quester?.getSemanticTokens() || []);
    // semanticTokens.push(...this.first?.getSemanticTokens() || []);
    // semanticTokens.push(...this.stop?.getSemanticTokens() || []);
    // semanticTokens.push(...this.finalEvents?.getSemanticTokens() || []);
    // semanticTokens.push(...this.npcOptions.flatMap(o => o.getSemanticTokens()));
    // semanticTokens.push(...this.playerOptions.flatMap(o => o.getSemanticTokens()));
    // return semanticTokens;
  };

  getHoverInfo(offset: number, documentUri: string): HoverInfo[] {
    const hoverInfo: HoverInfo[] = [];
    if (documentUri !== this.uri) {
      return hoverInfo;
    }
    return this.children.flatMap(c => c.getHoverInfo(offset));
    // hoverInfo.push(...this.first?.getHoverInfo(offset) || []);
    // hoverInfo.push(...this.finalEvents?.getHoverInfo(offset) || []);
    // hoverInfo.push(...this.npcOptions.flatMap(o => o.getHoverInfo(offset)));
    // hoverInfo.push(...this.playerOptions.flatMap(o => o.getHoverInfo(offset)));
    // return hoverInfo;
  }

  getDefinitions(offset: number, uri: string): LocationLinkOffset[] {
    if (uri !== this.uri) {
      return [];
    }

    return this.children.flatMap(c => c.getDefinitions(offset));

    // return [
    //   ...this.first?.getDefinitions(offset) || [],
    //   ...this.finalEvents?.getDefinitions(offset) || [],
    //   ...this.npcOptions.flatMap(o => o.getDefinitions(offset)),
    //   ...this.playerOptions.flatMap(o => o.getDefinitions(offset)),
    // ];
  }

  getConversationOptions<T extends ConversationOptionType>(type: T, optionID: string): Option<T>[] {
    switch (type) {
      case "ConversationNpcOption":
        return this.getChildren<Option<ConversationNpcOptionType>>('ConversationNpcOption').filter(o => o.id === optionID) as Option<T>[];
      case "ConversationPlayerOption":
        return this.getChildren<Option<ConversationPlayerOptionType>>('ConversationPlayerOption').filter(o => o.id === optionID) as Option<T>[];
    }
    return [];
  }
}
