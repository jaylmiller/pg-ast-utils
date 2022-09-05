import assert from 'assert';

/**
 * iterate over the nodes of the ast
 * ### example
 * ```ts
 * import {parse} from 'pgsql-parser';
 * for (let n of traverse(pgsql.parse("select 1"))) {
 *   console.log(n.type);
 * }
 * ```
 * @param node ast node
 */
export function* traverse(node: PgAst.AstNodeType): Generator<PgAst.AstNode> {
  for (let [key, value] of Object.entries(node)) {
    if (Array.isArray(value)) for (let v of value) yield* traverse(v);
    else if (PgAst.isNodeType(key) && value) {
      assert(typeof value === 'object');
      yield {type: key, node: value} as PgAst.AstNode;
      yield* traverse(value);
    } else if (typeof value === 'object') yield* traverse(value);
  }
}

export function createNode<T extends PgAst.AstNodeTypeName>(t: T, n) {}
export namespace PgAst {
  type Int = number & {__int__: void};
  export interface Statement {
    RawStmt: RawStmt;
  }

  export interface RawStmt {
    stmt: {
      CreateSchemaStmt?: CreateSchemaStmt;
      CreateStmt?: CreateStmt;
      AlterTableStmt?: AlterTableStmt;
      RenameStmt?: RenameStmt;
      AlterDefaultPrivilegesStmt?: AlterDefaultPrivilegesStmt;
      GrantStmt?: GrantStmt;
      CommentStmt?: CommentStmt;
      SelectStmt?: SelectStmt;
      VariableSetStmt?: VariableSetStmt;
      VariableShowStmt?: VariableShowStmt;
      DoStmt?: DoStmt;
      CreateDomainStmt?: CreateDomainStmt;
      CreateEnumStmt?: CreateEnumStmt;
      CreateExtensionStmt?: CreateExtensionStmt;
      CreateFunctionStmt?: CreateFunctionStmt;
      TransactionStmt?: TransactionStmt;
      IndexStmt?: IndexStmt;
      CreatePolicyStmt?: CreatePolicyStmt;
      CreateRoleStmt?: CreateRoleStmt;
      GrantRoleStmt?: GrantRoleStmt;
      RuleStmt?: RuleStmt;
      UpdateStmt?: UpdateStmt;
      DeleteStmt?: DeleteStmt;
      InsertStmt?: InsertStmt;
      CreateSeqStmt?: CreateSeqStmt;
      DropStmt?: DropStmt;
      CreateTrigStmt?: CreateTrigStmt;
      CompositeTypeStmt?: CompositeTypeStmt;
      ExplainStmt?: ExplainStmt;
      ViewStmt?: ViewStmt;
      DefineStmt?: DefineStmt;
      DropRoleStmt?: DropRoleStmt;
      AlterOwnerStmt?: AlterOwnerStmt;
      AlterObjectSchemaStmt?: AlterObjectSchemaStmt;
      CreateConversionStmt?: CreateConversionStmt;
      CreateFdwStmt?: CreateFdwStmt;
      CreateForeignServerStmt?: CreateForeignServerStmt;
      CreatePLangStmt?: CreatePLangStmt;
      CreateOpFamilyStmt?: CreateOpFamilyStmt;
      CreateOpClassStmt?: CreateOpClassStmt;
      AlterOpFamilyStmt?: AlterOpFamilyStmt;
      AlterOperatorStmt?: AlterOperatorStmt;
      VacuumStmt?: VacuumStmt;
      CreateTableAsStmt?: CreateTableAsStmt;
      AlterFunctionStmt?: AlterFunctionStmt;
      TruncateStmt?: TruncateStmt;
      NotifyStmt?: NotifyStmt;
      ListenStmt?: ListenStmt;
      UnlistenStmt?: UnlistenStmt;
      ClusterStmt?: ClusterStmt;
      CreateRangeStmt?: CreateRangeStmt;
      DeclareCursorStmt?: DeclareCursorStmt;
      FetchStmt?: FetchStmt;
      CreateAmStmt?: CreateAmStmt;
      CreateCastStmt?: CreateCastStmt;
      ReindexStmt?: ReindexStmt;
      DropOwnedStmt?: DropOwnedStmt;
      ReassignOwnedStmt?: ReassignOwnedStmt;
      AlterSeqStmt?: AlterSeqStmt;
      AlterDomainStmt?: AlterDomainStmt;
      PrepareStmt?: PrepareStmt;
      ExecuteStmt?: ExecuteStmt;
      AlterEnumStmt?: AlterEnumStmt;
      CreateEventTrigStmt?: CreateEventTrigStmt;
      AlterEventTrigStmt?: AlterEventTrigStmt;
      CreateUserMappingStmt?: CreateUserMappingStmt;
      AlterRoleStmt?: AlterRoleStmt;
      AlterPolicyStmt?: AlterPolicyStmt;
      AlterFdwStmt?: AlterFdwStmt;
      AlterForeignServerStmt?: AlterForeignServerStmt;
      AlterUserMappingStmt?: AlterUserMappingStmt;
      DropUserMappingStmt?: DropUserMappingStmt;
      CreateForeignTableStmt?: CreateForeignTableStmt;
      ImportForeignSchemaStmt?: ImportForeignSchemaStmt;
      ConstraintsSetStmt?: ConstraintsSetStmt;
      DiscardStmt?: DiscardStmt;
      LockStmt?: LockStmt;
      AlterRoleSetStmt?: AlterRoleSetStmt;
      RefreshMatViewStmt?: RefreshMatViewStmt;
      CreateTransformStmt?: CreateTransformStmt;
      ClosePortalStmt?: ClosePortalStmt;
      DeallocateStmt?: DeallocateStmt;
      ReplicaIdentityStmt?: ReplicaIdentityStmt;
      SecLabelStmt?: SecLabelStmt;
      CopyStmt?: CopyStmt;
      AlterTSConfigurationStmt?: AlterTSConfigurationStmt;
    };
    stmt_len: Int;
  }

  type Stmt = RawStmt['stmt'];

  interface CreateSchemaStmt {
    schemaname: string;
    if_not_exists: boolean;
    schemaElts: any[];
    authrole: any;
  }

  interface CreateStmt {
    relation: any;
    tableElts: any[];
    oncommit: Int;
    inhRelations: any[];
    options: any[];
    ofTypename: any;
    if_not_exists: boolean;
  }

  interface RangeVar {
    schemaname: string;
    relname: string;
    inh: boolean;
    relpersistence: string;
    alias: any;
  }

  interface ColumnDef {
    colname: string;
    typeName: any;
    is_local: boolean;
    constraints: any[];
    raw_default: any;
    collClause: any;
    fdwoptions: any[];
  }

  interface TypeName {
    names: any[];
    typemod: Int;
    typmods: any[];
    setof: boolean;
    arrayBounds: any[];
  }

  interface String {
    str: string;
  }

  interface Constraint {
    contype: Int;
    raw_expr: any;
    conname: string;
    pktable: any;
    fk_attrs: any[];
    pk_attrs: any[];
    fk_matchtype: string;
    fk_upd_action: string;
    fk_del_action: string;
    initially_valid: boolean;
    keys: any[];
    is_no_inherit: boolean;
    skip_validation: boolean;
    exclusions: object[][];
    access_method: string;
    deferrable: boolean;
    indexname: string;
  }

  interface A_Const {
    val: any;
  }

  interface Integer {
    ival: Int;
  }

  interface AlterTableStmt {
    relation: any;
    cmds: any[];
    relkind: Int;
    missing_ok: boolean;
  }

  interface AlterTableCmd {
    subtype: Int;
    behavior: Int;
    name: string;
    def: any;
    missing_ok: boolean;
    newowner: any;
  }

  interface SQLValueFunction {
    op: Int;
    typmod: Int;
  }

  interface RenameStmt {
    renameType: Int;
    relationType: Int;
    relation: any;
    subname: string;
    newname: string;
    behavior: Int;
    object: any;
    missing_ok: boolean;
  }

  enum A_Expr_Kind {
    AEXPR_OP /* normal operator */,
    AEXPR_OP_ANY /* scalar op ANY (array) */,
    AEXPR_OP_ALL /* scalar op ALL (array) */,
    AEXPR_DISTINCT /* IS DISTINCT FROM - name must be "=" */,
    AEXPR_NOT_DISTINCT /* IS NOT DISTINCT FROM - name must be "=" */,
    AEXPR_NULLIF /* NULLIF - name must be "=" */,
    AEXPR_IN /* [NOT] IN - name must be "=" or "<>" */,
    AEXPR_LIKE /* [NOT] LIKE - name must be "~~" or "!~~" */,
    AEXPR_ILIKE /* [NOT] ILIKE - name must be "~~*" or "!~~*" */,
    AEXPR_SIMILAR /* [NOT] SIMILAR - name must be "~" or "!~" */,
    AEXPR_BETWEEN /* name must be "BETWEEN" */,
    AEXPR_NOT_BETWEEN /* name must be "NOT BETWEEN" */,
    AEXPR_BETWEEN_SYM /* name must be "BETWEEN SYMMETRIC" */,
    AEXPR_NOT_BETWEEN_SYM /* name must be "NOT BETWEEN SYMMETRIC" */
  }

  interface A_Expr {
    kind: A_Expr_Kind;
    name: any[];
    lexpr: any;
    rexpr: any;
  }

  interface TypeCast {
    arg: any;
    typeName: any;
  }

  interface ColumnRef {
    fields: any[];
  }

  interface FuncCall {
    funcname: any[];
    args: any[];
    agg_star: boolean;
    func_variadic: boolean;
    agg_order: any[];
    agg_distinct: boolean;
    agg_filter: any;
    agg_within_group: boolean;
    over: any;
  }

  interface AlterDefaultPrivilegesStmt {
    options: any[];
    action: any;
  }

  interface DefElem {
    defname: string;
    arg: any[];
    defaction: Int;
    defnamespace: string;
  }

  interface GrantStmt {
    is_grant: boolean;
    targtype: Int;
    objtype: Int;
    privileges: any[];
    grantees: any[];
    behavior: Int;
    objects: any[];
    grant_option: boolean;
  }

  interface AccessPriv {
    priv_name: string;
    cols: any[];
  }

  interface RoleSpec {
    roletype: Int;
    rolename: string;
  }

  interface CommentStmt {
    objtype: Int;
    object: any[];
    comment: string;
  }

  interface ObjectWithArgs {
    objname: any[];
    objargs: any[];
    args_unspecified: boolean;
  }

  interface SelectStmt {
    targetList: any[];
    fromClause: any[];
    groupClause: any[];
    havingClause: any;
    op: Int;
    sortClause: any[];
    whereClause: any;
    distinctClause: any[];
    limitCount: any;
    valuesLists: object[][];
    intoClause: any;
    all: boolean;
    larg: any;
    rarg: any;
    limitOffset: any;
    withClause: any;
    lockingClause: any[];
    windowClause: any[];
  }

  interface ResTarget {
    val: any;
    name: string;
    indirection: any[];
  }

  interface Alias {
    aliasname: string;
    colnames: any[];
  }

  interface JoinExpr {
    jointype: Int;
    larg: any;
    rarg: any;
    quals: any;
    usingClause: any[];
    isNatural: boolean;
    alias: any;
  }

  interface BoolExpr {
    boolop: Int;
    args: any[];
  }

  interface A_Star {}

  interface SortBy {
    node: any;
    sortby_dir: Int;
    sortby_nulls: Int;
    useOp: any[];
  }

  interface NamedArgExpr {
    arg: any;
    name: string;
    argnumber: Int;
  }

  interface A_ArrayExpr {
    elements: any[];
  }

  interface Float {
    str: string;
  }

  interface RangeFunction {
    is_rowsfrom: boolean;
    functions: object[][];
    coldeflist: any[];
    alias: any;
    lateral: boolean;
    ordinality: boolean;
  }

  interface SubLink {
    subLinkType: Int;
    subselect: any;
    testexpr: any;
    operName: any[];
  }

  interface Null {}

  interface VariableSetStmt {
    kind: Int;
    name: string;
    args: any[];
    is_local: boolean;
  }

  interface VariableShowStmt {
    name: string;
  }

  interface DoStmt {
    args: any[];
  }

  interface CreateDomainStmt {
    domainname: any[];
    typeName: any;
    constraints: any[];
    collClause: any;
  }

  interface CreateEnumStmt {
    typeName: any[];
    vals: any[];
  }

  interface CreateExtensionStmt {
    extname: string;
    options: any[];
    if_not_exists: boolean;
  }

  interface CreateFunctionStmt {
    replace: boolean;
    funcname: any[];
    parameters: any[];
    returnType: any;
    options: any[];
  }

  interface FunctionParameter {
    name: string;
    argType: any;
    mode: Int;
    defexpr: any;
  }

  interface TransactionStmt {
    kind: TransactionStmtKind;
    options: any[];
    gid: string;
  }

  enum TransactionStmtKind {
    TRANS_STMT_BEGIN,
    TRANS_STMT_START,
    TRANS_STMT_COMMIT,
    TRANS_STMT_ROLLBACK,
    TRANS_STMT_SAVEPOINT,
    TRANS_STMT_RELEASE,
    TRANS_STMT_ROLLBACK_TO,
    TRANS_STMT_PREPARE,
    TRANS_STMT_COMMIT_PREPARED,
    TRANS_STMT_ROLLBACK_PREPARED
  }

  interface IndexStmt {
    idxname: string;
    relation: any;
    accessMethod: string;
    indexParams: any[];
    concurrent: boolean;
    unique: boolean;
    whereClause: any;
    options: any[];
    if_not_exists: boolean;
  }

  interface IndexElem {
    name: string;
    ordering: Int;
    nulls_ordering: Int;
    expr: any;
    opclass: any[];
    collation: any[];
  }

  interface NullTest {
    arg: any;
    nulltesttype: Int;
  }

  interface ParamRef {
    number: Int;
  }

  interface CreatePolicyStmt {
    policy_name: string;
    table: any;
    cmd_name: string;
    permissive: boolean;
    roles: any[];
    qual: any;
    with_check: any;
  }

  interface RangeSubselect {
    subquery: any;
    alias: any;
    lateral: boolean;
  }

  interface A_Indirection {
    arg: any;
    indirection: any[];
  }

  interface RowExpr {
    args: any[];
    row_format: Int;
  }

  interface CreateRoleStmt {
    stmt_type: Int;
    role: string;
    options: any[];
  }

  interface GrantRoleStmt {
    granted_roles: any[];
    grantee_roles: any[];
    is_grant: boolean;
    behavior: Int;
    admin_opt: boolean;
  }

  interface RuleStmt {
    relation: any;
    rulename: string;
    event: Int;
    instead: boolean;
    actions: any[];
    whereClause: any;
    replace: boolean;
  }

  interface UpdateStmt {
    relation: any;
    targetList: any[];
    whereClause: any;
    returningList: any[];
    fromClause: any[];
    withClause: any;
  }

  interface DeleteStmt {
    relation: any;
    whereClause: any;
    usingClause: any[];
    returningList: any[];
    withClause: any;
  }

  interface InsertStmt {
    relation: any;
    selectStmt: any;
    override: any;
    cols: any[];
    onConflictClause: any;
    returningList: any[];
    withClause: any;
  }

  interface CreateSeqStmt {
    sequence: any;
    options: any[];
    if_not_exists: boolean;
  }

  interface OnConflictClause {
    action: Int;
    infer: any;
    targetList: any[];
    whereClause: any;
  }

  interface InferClause {
    indexElems: any[];
    conname: string;
    whereClause: any;
  }

  interface MultiAssignRef {
    source: any;
    colno: Int;
    ncolumns: Int;
  }

  interface SetToDefault {}

  interface MinMaxExpr {
    op: Int;
    args: any[];
  }

  interface DropStmt {
    objects: object[][];
    removeType: Int;
    behavior: Int;
    missing_ok: boolean;
    concurrent: boolean;
  }

  interface CreateTrigStmt {
    trigname: string;
    relation: any;
    funcname: any[];
    row: boolean;
    timing: Int;
    events: Int;
    args: any[];
    columns: any[];
    whenClause: any;
    transitionRels: any[];
    isconstraint: boolean;
    deferrable: boolean;
    initdeferred: boolean;
  }

  type TriggerTransition = {
    name: string;
    isNew: boolean;
    isTable: boolean;
  };

  interface CompositeTypeStmt {
    typevar: any;
    coldeflist: any[];
  }

  interface ExplainStmt {
    query: any;
    options: any[];
  }

  interface ViewStmt {
    view: any;
    query: any;
    withCheckOption: Int;
    replace: boolean;
    aliases: any[];
    options: any[];
  }

  interface CollateClause {
    arg: any;
    collname: any[];
  }

  interface DefineStmt {
    kind: Int;
    defnames: any[];
    args: object[][];
    definition: any[];
    oldstyle: boolean;
  }

  interface DropRoleStmt {
    roles: any[];
    missing_ok: boolean;
  }

  interface AlterOwnerStmt {
    objectType: Int;
    object: any;
    newowner: any;
  }

  interface AlterObjectSchemaStmt {
    objectType: Int;
    object: any;
    newschema: string;
    relation: any;
    missing_ok: boolean;
  }

  interface CreateConversionStmt {
    conversion_name: any[];
    for_encoding_name: string;
    to_encoding_name: string;
    func_name: any[];
    def: boolean;
  }

  interface CreateFdwStmt {
    fdwname: string;
    func_options: any[];
    options: any[];
  }

  interface CreateForeignServerStmt {
    servername: string;
    fdwname: string;
    options: any[];
    servertype: string;
    version: string;
  }

  interface CreatePLangStmt {
    plname: string;
    plhandler: any[];
  }

  interface CreateOpFamilyStmt {
    opfamilyname: any[];
    amname: string;
  }

  interface CreateOpClassStmt {
    opclassname: any[];
    amname: string;
    datatype: any;
    items: any[];
    isDefault: boolean;
  }

  interface CreateOpClassItem {
    itemtype: Int;
    storedtype: any;
    name: any;
    number: Int;
    class_args: any[];
    order_family: any[];
  }

  interface AlterOpFamilyStmt {
    opfamilyname: any[];
    amname: string;
    items: any[];
    isDrop: boolean;
  }

  interface AlterOperatorStmt {
    opername: any;
    options: any[];
  }

  interface VacuumStmt {
    options: Int;
    relation: any;
    va_cols: any[];
  }

  interface CreateTableAsStmt {
    query: any;
    into: any;
    relkind: Int;
    if_not_exists: boolean;
  }

  interface IntoClause {
    rel: any;
    onCommit: Int;
    colNames: any[];
    skipData: boolean;
    options: any[];
  }

  interface CaseExpr {
    args: any[];
    defresult: any;
    arg: any;
  }

  interface CaseWhen {
    expr: any;
    result: any;
  }

  interface BooleanTest {
    arg: any;
    booltesttype: Int;
  }

  interface AlterFunctionStmt {
    func: any;
    actions: any[];
  }

  interface TruncateStmt {
    relations: any[];
    behavior: Int;
    restart_seqs: boolean;
  }

  interface A_Indices {
    is_slice: boolean;
    lidx: any;
    uidx: any;
  }

  interface NotifyStmt {
    conditionname: string;
  }

  interface ListenStmt {
    conditionname: string;
  }

  interface UnlistenStmt {
    conditionname: string;
  }

  interface BitString {
    str: string;
  }

  interface CoalesceExpr {
    args: any[];
  }

  interface ClusterStmt {
    relation: any;
    indexname: string;
  }

  interface TableLikeClause {
    relation: any;
    options: Int;
  }

  interface WithClause {
    ctes: any[];
    recursive: boolean;
  }

  interface CommonTableExpr {
    ctename: string;
    aliascolnames: any[];
    ctequery: any;
  }

  interface CreateRangeStmt {
    typeName: any[];
    params: any[];
  }

  interface DeclareCursorStmt {
    portalname: string;
    options: Int;
    query: any;
  }

  interface FetchStmt {
    direction: Int;
    howMany: Int;
    portalname: string;
    ismove: boolean;
  }

  interface LockingClause {
    strength: Int;
    waitPolicy: Int;
    lockedRels: any[];
  }

  interface CreateAmStmt {
    amname: string;
    handler_name: any[];
    amtype: string;
  }

  interface CreateCastStmt {
    sourcetype: any;
    targettype: any;
    context: Int;
    inout: boolean;
    func: any;
  }

  interface ReindexStmt {
    kind: Int;
    relation: any;
    options: Int;
    name: string;
  }

  interface DropOwnedStmt {
    roles: any[];
    behavior: Int;
  }

  interface ReassignOwnedStmt {
    roles: any[];
    newrole: any;
  }

  interface AlterSeqStmt {
    sequence: any;
    options: any[];
    missing_ok: boolean;
  }

  interface AlterDomainStmt {
    subtype: string;
    typeName: any[];
    behavior: Int;
    def: any;
    name: string;
    missing_ok: boolean;
  }

  interface PrepareStmt {
    name: string;
    query: any;
    argtypes: any[];
  }

  interface ExecuteStmt {
    name: string;
    params: any[];
  }

  interface AlterEnumStmt {
    typeName: any[];
    newVal: string;
    newValIsAfter: boolean;
    newValNeighbor: string;
    skipIfNewValExists: boolean;
  }

  interface CreateEventTrigStmt {
    trigname: string;
    eventname: string;
    funcname: any[];
    whenclause: any[];
  }

  interface AlterEventTrigStmt {
    trigname: string;
    tgenabled: string;
  }

  interface CreateUserMappingStmt {
    user: any;
    servername: string;
    options: any[];
  }

  interface AlterRoleStmt {
    role: any;
    options: any[];
    action: Int;
  }

  interface AlterPolicyStmt {
    policy_name: string;
    table: any;
    qual: any;
  }

  interface AlterFdwStmt {
    fdwname: string;
    func_options: any[];
    options: any[];
  }

  interface AlterForeignServerStmt {
    servername: string;
    version: string;
    options: any[];
    has_version: boolean;
  }

  interface AlterUserMappingStmt {
    user: any;
    servername: string;
    options: any[];
  }

  interface DropUserMappingStmt {
    user: any;
    servername: string;
    missing_ok: boolean;
  }

  interface CreateForeignTableStmt {
    base: any;
    servername: string;
    options: any[];
  }

  interface ImportForeignSchemaStmt {
    server_name: string;
    remote_schema: string;
    local_schema: string;
    list_type: Int;
    table_list: any[];
    options: any[];
  }

  interface ConstraintsSetStmt {
    deferred: boolean;
  }

  interface GroupingFunc {
    args: any[];
  }

  interface GroupingSet {
    kind: Int;
    content: any[];
  }

  interface WindowDef {
    orderClause: any[];
    frameOptions: Int;
    partitionClause: any[];
    name: string;
    startOffset: any;
    endOffset: any;
  }

  interface DiscardStmt {
    target: Int;
  }

  interface LockStmt {
    relations: any[];
    mode: Int;
    nowait: boolean;
  }

  interface AlterRoleSetStmt {
    role: any;
    setstmt: any;
  }

  interface RefreshMatViewStmt {
    relation: any;
    concurrent: boolean;
    skipData: boolean;
  }

  interface CreateTransformStmt {
    type_name: any;
    lang: string;
    fromsql: any;
    tosql: any;
  }

  interface ClosePortalStmt {
    portalname: string;
  }

  interface CurrentOfExpr {
    cursor_name: string;
  }

  interface DeallocateStmt {
    name: string;
  }

  interface ReplicaIdentityStmt {
    identity_type: string;
    name: string;
  }

  interface RangeTableSample {
    relation: any;
    method: any[];
    args: any[];
    repeatable: any;
  }

  interface SecLabelStmt {
    objtype: Int;
    object: any[];
    label: string;
    provider: string;
  }

  interface CopyStmt {
    query: any;
    filename: string;
  }

  interface AlterTSConfigurationStmt {
    kind: Int;
    cfgname: any[];
    tokentype: any[];
    dicts: object[][];
    override: boolean;
    replace: boolean;
  }

  interface XmlExpr {
    op: Int;
    args: any[];
    name: string;
    xmloption: Int;
    named_args: any[];
  }

  interface XmlSerialize {
    xmloption: Int;
    expr: any;
    typeName: any;
  }

  export function isNodeType(v: string): v is AstNodeTypeName {
    return AST_TYPES.includes(v as AstNodeTypeName);
  }

  export type AstNodeTypeName = AstNode['type'];
  export type AstNodeType = AstNode['node'];

  export const AST_TYPES: AstNodeTypeName[] = [
    'CreateSchemaStmt',
    'CreateStmt',
    'RangeVar',
    'ColumnDef',
    'TypeName',
    'String',
    'Constraint',
    'A_Const',
    'Integer',
    'AlterTableStmt',
    'AlterTableCmd',
    'SQLValueFunction',
    'RenameStmt',
    'A_Expr',
    'TypeCast',
    'ColumnRef',
    'FuncCall',
    'AlterDefaultPrivilegesStmt',
    'DefElem',
    'GrantStmt',
    'AccessPriv',
    'RoleSpec',
    'CommentStmt',
    'ObjectWithArgs',
    'SelectStmt',
    'ResTarget',
    'Alias',
    'JoinExpr',
    'BoolExpr',
    'A_Star',
    'SortBy',
    'NamedArgExpr',
    'A_ArrayExpr',
    'Float',
    'RangeFunction',
    'SubLink',
    'Null',
    'VariableSetStmt',
    'VariableShowStmt',
    'DoStmt',
    'CreateDomainStmt',
    'CreateEnumStmt',
    'CreateExtensionStmt',
    'CreateFunctionStmt',
    'FunctionParameter',
    'TransactionStmt',
    'IndexStmt',
    'IndexElem',
    'NullTest',
    'ParamRef',
    'CreatePolicyStmt',
    'RangeSubselect',
    'A_Indirection',
    'RowExpr',
    'CreateRoleStmt',
    'GrantRoleStmt',
    'RuleStmt',
    'UpdateStmt',
    'DeleteStmt',
    'InsertStmt',
    'CreateSeqStmt',
    'OnConflictClause',
    'InferClause',
    'MultiAssignRef',
    'SetToDefault',
    'MinMaxExpr',
    'DropStmt',
    'CreateTrigStmt',
    'CompositeTypeStmt',
    'ExplainStmt',
    'ViewStmt',
    'CollateClause',
    'DefineStmt',
    'DropRoleStmt',
    'AlterOwnerStmt',
    'AlterObjectSchemaStmt',
    'CreateConversionStmt',
    'CreateFdwStmt',
    'CreateForeignServerStmt',
    'CreatePLangStmt',
    'CreateOpFamilyStmt',
    'CreateOpClassStmt',
    'CreateOpClassItem',
    'AlterOpFamilyStmt',
    'AlterOperatorStmt',
    'VacuumStmt',
    'CreateTableAsStmt',
    'IntoClause',
    'CaseExpr',
    'CaseWhen',
    'BooleanTest',
    'AlterFunctionStmt',
    'TruncateStmt',
    'A_Indices',
    'NotifyStmt',
    'ListenStmt',
    'UnlistenStmt',
    'BitString',
    'CoalesceExpr',
    'ClusterStmt',
    'TableLikeClause',
    'WithClause',
    'CommonTableExpr',
    'CreateRangeStmt',
    'DeclareCursorStmt',
    'FetchStmt',
    'LockingClause',
    'CreateAmStmt',
    'CreateCastStmt',
    'ReindexStmt',
    'DropOwnedStmt',
    'ReassignOwnedStmt',
    'AlterSeqStmt',
    'AlterDomainStmt',
    'PrepareStmt',
    'ExecuteStmt',
    'AlterEnumStmt',
    'CreateEventTrigStmt',
    'AlterEventTrigStmt',
    'CreateUserMappingStmt',
    'AlterRoleStmt',
    'AlterPolicyStmt',
    'AlterFdwStmt',
    'AlterForeignServerStmt',
    'AlterUserMappingStmt',
    'DropUserMappingStmt',
    'CreateForeignTableStmt',
    'ImportForeignSchemaStmt',
    'ConstraintsSetStmt',
    'GroupingFunc',
    'GroupingSet',
    'WindowDef',
    'DiscardStmt',
    'LockStmt',
    'AlterRoleSetStmt',
    'RefreshMatViewStmt',
    'CreateTransformStmt',
    'ClosePortalStmt',
    'CurrentOfExpr',
    'DeallocateStmt',
    'ReplicaIdentityStmt',
    'RangeTableSample',
    'SecLabelStmt',
    'CopyStmt',
    'AlterTSConfigurationStmt',
    'XmlExpr',
    'XmlSerialize'
  ];
  export type AstNode =
    | {type: 'Statement'; node: Statement}
    | {type: 'RawStmt'; node: RawStmt}
    | {type: 'CreateSchemaStmt'; node: CreateSchemaStmt}
    | {type: 'CreateStmt'; node: CreateStmt}
    | {type: 'RangeVar'; node: RangeVar}
    | {type: 'ColumnDef'; node: ColumnDef}
    | {type: 'TypeName'; node: TypeName}
    | {type: 'String'; node: String}
    | {type: 'Constraint'; node: Constraint}
    | {type: 'A_Const'; node: A_Const}
    | {type: 'Integer'; node: Integer}
    | {type: 'AlterTableStmt'; node: AlterTableStmt}
    | {type: 'AlterTableCmd'; node: AlterTableCmd}
    | {type: 'SQLValueFunction'; node: SQLValueFunction}
    | {type: 'RenameStmt'; node: RenameStmt}
    | {type: 'A_Expr'; node: A_Expr}
    | {type: 'TypeCast'; node: TypeCast}
    | {type: 'ColumnRef'; node: ColumnRef}
    | {type: 'FuncCall'; node: FuncCall}
    | {type: 'AlterDefaultPrivilegesStmt'; node: AlterDefaultPrivilegesStmt}
    | {type: 'DefElem'; node: DefElem}
    | {type: 'GrantStmt'; node: GrantStmt}
    | {type: 'AccessPriv'; node: AccessPriv}
    | {type: 'RoleSpec'; node: RoleSpec}
    | {type: 'CommentStmt'; node: CommentStmt}
    | {type: 'ObjectWithArgs'; node: ObjectWithArgs}
    | {type: 'SelectStmt'; node: SelectStmt}
    | {type: 'ResTarget'; node: ResTarget}
    | {type: 'Alias'; node: Alias}
    | {type: 'JoinExpr'; node: JoinExpr}
    | {type: 'BoolExpr'; node: BoolExpr}
    | {type: 'A_Star'; node: A_Star}
    | {type: 'SortBy'; node: SortBy}
    | {type: 'NamedArgExpr'; node: NamedArgExpr}
    | {type: 'A_ArrayExpr'; node: A_ArrayExpr}
    | {type: 'Float'; node: Float}
    | {type: 'RangeFunction'; node: RangeFunction}
    | {type: 'SubLink'; node: SubLink}
    | {type: 'Null'; node: Null}
    | {type: 'VariableSetStmt'; node: VariableSetStmt}
    | {type: 'VariableShowStmt'; node: VariableShowStmt}
    | {type: 'DoStmt'; node: DoStmt}
    | {type: 'CreateDomainStmt'; node: CreateDomainStmt}
    | {type: 'CreateEnumStmt'; node: CreateEnumStmt}
    | {type: 'CreateExtensionStmt'; node: CreateExtensionStmt}
    | {type: 'CreateFunctionStmt'; node: CreateFunctionStmt}
    | {type: 'FunctionParameter'; node: FunctionParameter}
    | {type: 'TransactionStmt'; node: TransactionStmt}
    | {type: 'IndexStmt'; node: IndexStmt}
    | {type: 'IndexElem'; node: IndexElem}
    | {type: 'NullTest'; node: NullTest}
    | {type: 'ParamRef'; node: ParamRef}
    | {type: 'CreatePolicyStmt'; node: CreatePolicyStmt}
    | {type: 'RangeSubselect'; node: RangeSubselect}
    | {type: 'A_Indirection'; node: A_Indirection}
    | {type: 'RowExpr'; node: RowExpr}
    | {type: 'CreateRoleStmt'; node: CreateRoleStmt}
    | {type: 'GrantRoleStmt'; node: GrantRoleStmt}
    | {type: 'RuleStmt'; node: RuleStmt}
    | {type: 'UpdateStmt'; node: UpdateStmt}
    | {type: 'DeleteStmt'; node: DeleteStmt}
    | {type: 'InsertStmt'; node: InsertStmt}
    | {type: 'CreateSeqStmt'; node: CreateSeqStmt}
    | {type: 'OnConflictClause'; node: OnConflictClause}
    | {type: 'InferClause'; node: InferClause}
    | {type: 'MultiAssignRef'; node: MultiAssignRef}
    | {type: 'SetToDefault'; node: SetToDefault}
    | {type: 'MinMaxExpr'; node: MinMaxExpr}
    | {type: 'DropStmt'; node: DropStmt}
    | {type: 'CreateTrigStmt'; node: CreateTrigStmt}
    | {type: 'CompositeTypeStmt'; node: CompositeTypeStmt}
    | {type: 'ExplainStmt'; node: ExplainStmt}
    | {type: 'ViewStmt'; node: ViewStmt}
    | {type: 'CollateClause'; node: CollateClause}
    | {type: 'DefineStmt'; node: DefineStmt}
    | {type: 'DropRoleStmt'; node: DropRoleStmt}
    | {type: 'AlterOwnerStmt'; node: AlterOwnerStmt}
    | {type: 'AlterObjectSchemaStmt'; node: AlterObjectSchemaStmt}
    | {type: 'CreateConversionStmt'; node: CreateConversionStmt}
    | {type: 'CreateFdwStmt'; node: CreateFdwStmt}
    | {type: 'CreateForeignServerStmt'; node: CreateForeignServerStmt}
    | {type: 'CreatePLangStmt'; node: CreatePLangStmt}
    | {type: 'CreateOpFamilyStmt'; node: CreateOpFamilyStmt}
    | {type: 'CreateOpClassStmt'; node: CreateOpClassStmt}
    | {type: 'CreateOpClassItem'; node: CreateOpClassItem}
    | {type: 'AlterOpFamilyStmt'; node: AlterOpFamilyStmt}
    | {type: 'AlterOperatorStmt'; node: AlterOperatorStmt}
    | {type: 'VacuumStmt'; node: VacuumStmt}
    | {type: 'CreateTableAsStmt'; node: CreateTableAsStmt}
    | {type: 'IntoClause'; node: IntoClause}
    | {type: 'CaseExpr'; node: CaseExpr}
    | {type: 'CaseWhen'; node: CaseWhen}
    | {type: 'BooleanTest'; node: BooleanTest}
    | {type: 'AlterFunctionStmt'; node: AlterFunctionStmt}
    | {type: 'TruncateStmt'; node: TruncateStmt}
    | {type: 'A_Indices'; node: A_Indices}
    | {type: 'NotifyStmt'; node: NotifyStmt}
    | {type: 'ListenStmt'; node: ListenStmt}
    | {type: 'UnlistenStmt'; node: UnlistenStmt}
    | {type: 'BitString'; node: BitString}
    | {type: 'CoalesceExpr'; node: CoalesceExpr}
    | {type: 'ClusterStmt'; node: ClusterStmt}
    | {type: 'TableLikeClause'; node: TableLikeClause}
    | {type: 'WithClause'; node: WithClause}
    | {type: 'CommonTableExpr'; node: CommonTableExpr}
    | {type: 'CreateRangeStmt'; node: CreateRangeStmt}
    | {type: 'DeclareCursorStmt'; node: DeclareCursorStmt}
    | {type: 'FetchStmt'; node: FetchStmt}
    | {type: 'LockingClause'; node: LockingClause}
    | {type: 'CreateAmStmt'; node: CreateAmStmt}
    | {type: 'CreateCastStmt'; node: CreateCastStmt}
    | {type: 'ReindexStmt'; node: ReindexStmt}
    | {type: 'DropOwnedStmt'; node: DropOwnedStmt}
    | {type: 'ReassignOwnedStmt'; node: ReassignOwnedStmt}
    | {type: 'AlterSeqStmt'; node: AlterSeqStmt}
    | {type: 'AlterDomainStmt'; node: AlterDomainStmt}
    | {type: 'PrepareStmt'; node: PrepareStmt}
    | {type: 'ExecuteStmt'; node: ExecuteStmt}
    | {type: 'AlterEnumStmt'; node: AlterEnumStmt}
    | {type: 'CreateEventTrigStmt'; node: CreateEventTrigStmt}
    | {type: 'AlterEventTrigStmt'; node: AlterEventTrigStmt}
    | {type: 'CreateUserMappingStmt'; node: CreateUserMappingStmt}
    | {type: 'AlterRoleStmt'; node: AlterRoleStmt}
    | {type: 'AlterPolicyStmt'; node: AlterPolicyStmt}
    | {type: 'AlterFdwStmt'; node: AlterFdwStmt}
    | {type: 'AlterForeignServerStmt'; node: AlterForeignServerStmt}
    | {type: 'AlterUserMappingStmt'; node: AlterUserMappingStmt}
    | {type: 'DropUserMappingStmt'; node: DropUserMappingStmt}
    | {type: 'CreateForeignTableStmt'; node: CreateForeignTableStmt}
    | {type: 'ImportForeignSchemaStmt'; node: ImportForeignSchemaStmt}
    | {type: 'ConstraintsSetStmt'; node: ConstraintsSetStmt}
    | {type: 'GroupingFunc'; node: GroupingFunc}
    | {type: 'GroupingSet'; node: GroupingSet}
    | {type: 'WindowDef'; node: WindowDef}
    | {type: 'DiscardStmt'; node: DiscardStmt}
    | {type: 'LockStmt'; node: LockStmt}
    | {type: 'AlterRoleSetStmt'; node: AlterRoleSetStmt}
    | {type: 'RefreshMatViewStmt'; node: RefreshMatViewStmt}
    | {type: 'CreateTransformStmt'; node: CreateTransformStmt}
    | {type: 'ClosePortalStmt'; node: ClosePortalStmt}
    | {type: 'CurrentOfExpr'; node: CurrentOfExpr}
    | {type: 'DeallocateStmt'; node: DeallocateStmt}
    | {type: 'ReplicaIdentityStmt'; node: ReplicaIdentityStmt}
    | {type: 'RangeTableSample'; node: RangeTableSample}
    | {type: 'SecLabelStmt'; node: SecLabelStmt}
    | {type: 'CopyStmt'; node: CopyStmt}
    | {type: 'AlterTSConfigurationStmt'; node: AlterTSConfigurationStmt}
    | {type: 'XmlExpr'; node: XmlExpr}
    | {type: 'XmlSerialize'; node: XmlSerialize};

  // export type NodeForTypeName<T extends AstNodeTypeName> = {[K['type'] in AstNode]: }
}
