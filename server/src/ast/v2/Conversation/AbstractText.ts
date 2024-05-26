import { Scalar, YAMLMap, isMap, isScalar } from "yaml";

import { ConversationOptionType, ConversationTypes, NodeV2 } from "../../node";
import { ConversationSection } from "./Conversation";
import { AbstractTextTranslations } from "./AbstractTextTranslations";
import { Option } from "./Option/Option";

export abstract class AbstractText<NT extends ConversationTypes, TT extends AbstractTextTranslations<ConversationTypes>> extends NodeV2<NT> {
  abstract type: NT;
  uri: string;
  parent: ConversationSection | Option<ConversationOptionType>;

  yml: Scalar | YAMLMap;
  contentType?: 'string' | 'translations';
  contentString?: string;
  contentTranslations?: TT;

  constructor(yml: Scalar | YAMLMap, parent: ConversationSection | Option<ConversationOptionType>) {
    super();
    this.uri = parent.uri;
    this.parent = parent;
    this.yml = yml;
    this.offsetStart = this.yml.range?.[0];
    this.offsetEnd = this.yml.range?.[1];

    // Parse YAML
    if (isScalar(yml) && typeof yml.value === 'string') {
      this.contentType = 'string';
      this.contentString = yml.value;
    } else if (isMap<Scalar<string>>(yml)) {
      this.contentType = 'translations';
      this.contentTranslations = this.newTranslations(yml);
    }

  }

  getDiagnostics() {
    return [
      ...this.diagnostics,
      ...this.contentTranslations?.getDiagnostics() ?? []
    ];
  }

  abstract newTranslations(pair: YAMLMap<Scalar<string>>): TT;
}