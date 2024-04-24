import { Pair, Scalar, YAMLMap, isMap, isScalar } from "yaml";
import { Diagnostic, DiagnosticSeverity } from "vscode-languageserver";

import { ConversationTypes, Node } from "../../node";
import { Conversation } from "./Conversation";
import { AbstractTextTranslations } from "./AbstractTextTranslations";
import { DiagnosticCode } from "../../../utils/diagnostics";

export abstract class AbstractText<NT extends ConversationTypes, TT extends AbstractTextTranslations<ConversationTypes>> implements Node<NT> {
  abstract type: NT;
  uri: string;
  offsetStart?: number;
  offsetEnd?: number;
  parent?: Conversation;
  diagnostics: Diagnostic[] = [];

  yml: Scalar<string> | YAMLMap<Scalar<string>>;
  contentType?: 'string' | 'translations';
  contentString?: string;
  contentTranslations?: TT;

  constructor(uri: string, yml: Scalar<string> | YAMLMap<Scalar<string>>, parent: Conversation) {
    this.uri = uri;
    this.parent = parent;

    this.yml = yml;

    // Parse YAML
    if (isScalar<string>(yml)) {
      this.contentType = 'string';
      this.contentString = yml.value;
    } else if (isMap<Scalar<string>>(yml)) {
      this.contentType = 'translations';
      this.contentTranslations = this.newTranslations(uri, yml);
    }

  }

  getDiagnostics() {
    return [
      ...this.diagnostics,
      ...this.contentTranslations?.getDiagnostics() ?? []
    ];
  }

  abstract newTranslations(uri: string, pair: YAMLMap<Scalar<string>>): TT;
}
