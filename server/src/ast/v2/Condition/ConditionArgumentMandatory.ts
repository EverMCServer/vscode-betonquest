import { ArgumentType, ArgumentsPatternMandatory } from "betonquest-utils/betonquest/Arguments";

import { ConditionArgumentMandatoryType } from "../../node";
import { AbstractNodeV2 } from "../../v2";
import { ArgumentConditionID } from "../Argument/ArgumentConditionID";
import { ArgumentEntity } from "../Argument/ArgumentEntity";
import { ArgumentEntityList } from "../Argument/ArgumentEntityList";
import { ArgumentEntityListWithAmount } from "../Argument/ArgumentEntityListWithAmount";
import { ConditionArguments } from "./ConditionArguments";

export class ConditionArgumentMandatory extends AbstractNodeV2<ConditionArgumentMandatoryType> {
  readonly type: ConditionArgumentMandatoryType = 'ConditionArgumentMandatory'; // TODO remove Mandatory / Optional
  readonly offsetStart?: number;
  readonly offsetEnd?: number;
  readonly parent: ConditionArguments;

  private argumentStr: string;
  private pattern: ArgumentsPatternMandatory;

  constructor(argumentStr: string,
    range: [number?, number?],
    // isMandatory: boolean,
    pattern: ArgumentsPatternMandatory,
    parent: ConditionArguments,
  ) {
    super();
    this.parent = parent;

    this.offsetStart = range[0];
    this.offsetEnd = range[1];
    this.pattern = pattern;

    // Parse argumentStr
    this.argumentStr = argumentStr;

    switch (pattern.type) {
      case ArgumentType.conditionID:
        this.addChild(new ArgumentConditionID(argumentStr, range, this));
        break;
      case ArgumentType.entity:
        this.addChild(new ArgumentEntity(argumentStr, range, this));
        break;
      case ArgumentType.entityList:
        this.addChild(new ArgumentEntityList(argumentStr, range, this));
        break;
      case ArgumentType.entityListWithAmount:
        this.addChild(new ArgumentEntityListWithAmount(argumentStr, range, this));
        break;
    }
  }
}
