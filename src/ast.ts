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
export function* traverse(
  node: PgAst.AstNodeType
): Generator<PgAst.TraversedNode> {
  for (let [key, value] of Object.entries(node)) {
    if (Array.isArray(value)) for (let v of value) yield* traverse(v);
    else if (_isNodeType(key) && value) {
      assert(typeof value === 'object');
      yield {type: key, node: value} as PgAst.TraversedNode;
      yield* traverse(value);
    } else if (typeof value === 'object') yield* traverse(value);
  }
}
/**
 * return node in the foramt expected by pgsql-parser for deparsing
 * @param t
 * @param n
 */
export function createNode<T extends PgAst.AstNodeTypeName>(
  t: T,
  n: Partial<PgAst.AstNodes[T]>
): PgAst.TypeToAstNode<T> {
  return {
    [t]: n
  };
}

/**
 * creates deep copy of an AST node
 * @param node node to copy
 * @returns copied node
 */
export function copyNode<T extends PgAst.AstNodeType>(node: T): T {
  // every field in nodes are json serializable
  return JSON.parse(JSON.stringify(node));
}

/**
 * typeguard for {@link PgAst.AstNodeTypeName}
 */
export function _isNodeType(v: string): v is PgAst.AstNodeTypeName {
  return PgAst.AST_TYPES.includes(v as PgAst.AstNodeTypeName);
}

export namespace PgAst {
  type Int = number; // & {__int__: void};
  export interface Statement {
    RawStmt: RawStmt;
  }
  export type AstNodeTypeName = keyof AstNodes;
  export type AstNodeType = AstNodes[AstNodeTypeName];
  export type TraversedNode = {
    [K in keyof AstNodes]: {type: K; node: AstNodes[K]};
  }[keyof AstNodes];
  export type TypeToAstNode<T extends AstNodeTypeName> = {
    [K in keyof AstNodes as K extends T ? K : never]: Partial<AstNodes[K]>;
  };

  export interface RawStmt {
    stmt: {
      [K in keyof AstNodes as K extends `${string}Stmt` ? K : never]?: Partial<
        AstNodes[K]
      >;
    };
    stmt_len?: Int;
  }
  export function getNodeType(n: any) {
    const ks = Object.keys(n);
    if (ks.length !== 1) return null;
    const k = ks[0];
    if (!_isNodeType(k)) return null;
    return k;
  }
  export enum A_Expr_Kind {
    AEXPR_OP,
    AEXPR_OP_ANY,
    AEXPR_OP_ALL,
    AEXPR_DISTINCT,
    AEXPR_NOT_DISTINCT,
    AEXPR_NULLIF,
    AEXPR_IN,
    AEXPR_LIKE,
    AEXPR_ILIKE,
    AEXPR_SIMILAR,
    AEXPR_BETWEEN,
    AEXPR_NOT_BETWEEN,
    AEXPR_BETWEEN_SYM,
    AEXPR_NOT_BETWEEN_SYM
  }

  export enum TransactionStmtKind {
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

  // https://github.com/postgres/postgres/blob/master/src/include/nodes/parsenodes.h
  export type AstNodes = {
    Statement: {RawStmt: RawStmt};
    SelectStmt: {
      targetList: any[];
      fromClause: any[];
      groupClause: any[];
      havingClause: any;
      op: 'SETOP_NONE' | 'SETOP_UNION' | 'SETOP_INTERSECT' | 'SETOP_EXCEPT';
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
      withClause: AstNodes['WithClause'];
      lockingClause: any[];
      windowClause: any[];
    };
    CreateSchemaStmt: {
      schemaname: string;
      if_not_exists: boolean;
      schemaElts: any[];
      authrole: any;
    };
    CreateStmt: {
      relation: any;
      tableElts: any[];
      oncommit: Int;
      inhRelations: any[];
      options: any[];
      ofTypename: any;
      if_not_exists: boolean;
    };
    RangeVar: {
      schemaname: string;
      relname: string;
      inh: boolean;
      relpersistence: string;
      alias: any;
    };
    ColumnDef: {
      colname: string;
      typeName: any;
      is_local: boolean;
      constraints: any[];
      raw_default: any;
      collClause: any;
      fdwoptions: any[];
    };
    TypeName: {
      names: any[];
      typemod: Int;
      typmods: any[];
      setof: boolean;
      arrayBounds: any[];
    };
    String: {str: string};
    Constraint: {
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
    };
    A_Const: {val: any};
    Integer: {ival: Int};
    AlterTableStmt: {
      relation: any;
      cmds: any[];
      relkind: Int;
      missing_ok: boolean;
    };
    AlterTableCmd: {
      subtype: Int;
      behavior: Int;
      name: string;
      def: any;
      missing_ok: boolean;
      newowner: any;
    };
    SQLValueFunction: {op: Int; typmod: Int};
    RenameStmt: {
      renameType: Int;
      relationType: Int;
      relation: any;
      subname: string;
      newname: string;
      behavior: Int;
      object: any;
      missing_ok: boolean;
    };
    A_Expr: {kind: A_Expr_Kind; name: any[]; lexpr: any; rexpr: any};
    TypeCast: {arg: any; typeName: any};
    ColumnRef: {fields: any[]};
    FuncCall: {
      funcname: any[];
      args: any[];
      agg_star: boolean;
      func_variadic: boolean;
      agg_order: any[];
      agg_distinct: boolean;
      agg_filter: any;
      agg_within_group: boolean;
      over: any;
    };
    AlterDefaultPrivilegesStmt: {options: any[]; action: any};
    DefElem: {
      defname: string;
      arg: any[];
      defaction: Int;
      defnamespace: string;
    };
    GrantStmt: {
      is_grant: boolean;
      targtype: Int;
      objtype: Int;
      privileges: any[];
      grantees: any[];
      behavior: Int;
      objects: any[];
      grant_option: boolean;
    };
    AccessPriv: {priv_name: string; cols: any[]};
    RoleSpec: {roletype: Int; rolename: string};
    CommentStmt: {objtype: Int; object: any[]; comment: string};
    ObjectWithArgs: {objname: any[]; objargs: any[]; args_unspecified: boolean};

    ResTarget: {val: any; name: string; indirection: any[]};
    Alias: {aliasname: string; colnames: any[]};
    JoinExpr: {
      jointype: Int;
      larg: any;
      rarg: any;
      quals: any;
      usingClause: any[];
      isNatural: boolean;
      alias: any;
    };
    BoolExpr: {boolop: Int; args: any[]};
    A_Star: {};
    SortBy: {node: any; sortby_dir: Int; sortby_nulls: Int; useOp: any[]};
    NamedArgExpr: {arg: any; name: string; argnumber: Int};
    A_ArrayExpr: {elements: any[]};
    Float: {str: string};
    RangeFunction: {
      is_rowsfrom: boolean;
      functions: object[][];
      coldeflist: any[];
      alias: any;
      lateral: boolean;
      ordinality: boolean;
    };
    SubLink: {subLinkType: Int; subselect: any; testexpr: any; operName: any[]};
    Null: {};
    VariableSetStmt: {kind: Int; name: string; args: any[]; is_local: boolean};
    VariableShowStmt: {name: string};
    DoStmt: {args: any[]};
    CreateDomainStmt: {
      domainname: any[];
      typeName: any;
      constraints: any[];
      collClause: any;
    };
    CreateEnumStmt: {typeName: any[]; vals: any[]};
    CreateExtensionStmt: {
      extname: string;
      options: any[];
      if_not_exists: boolean;
    };
    CreateFunctionStmt: {
      replace: boolean;
      funcname: any[];
      parameters: any[];
      returnType: any;
      options: any[];
    };
    FunctionParameter: {name: string; argType: any; mode: Int; defexpr: any};
    TransactionStmt: {kind: TransactionStmtKind; options: any[]; gid: string};
    IndexStmt: {
      idxname: string;
      relation: any;
      accessMethod: string;
      indexParams: any[];
      concurrent: boolean;
      unique: boolean;
      whereClause: any;
      options: any[];
      if_not_exists: boolean;
    };
    IndexElem: {
      name: string;
      ordering: Int;
      nulls_ordering: Int;
      expr: any;
      opclass: any[];
      collation: any[];
    };
    NullTest: {arg: any; nulltesttype: Int};
    ParamRef: {number: Int};
    CreatePolicyStmt: {
      policy_name: string;
      table: any;
      cmd_name: string;
      permissive: boolean;
      roles: any[];
      qual: any;
      with_check: any;
    };
    RangeSubselect: {subquery: any; alias: any; lateral: boolean};
    A_Indirection: {arg: any; indirection: any[]};
    RowExpr: {args: any[]; row_format: Int};
    CreateRoleStmt: {stmt_type: Int; role: string; options: any[]};
    GrantRoleStmt: {
      granted_roles: any[];
      grantee_roles: any[];
      is_grant: boolean;
      behavior: Int;
      admin_opt: boolean;
    };
    RuleStmt: {
      relation: any;
      rulename: string;
      event: Int;
      instead: boolean;
      actions: any[];
      whereClause: any;
      replace: boolean;
    };
    UpdateStmt: {
      relation: any;
      targetList: any[];
      whereClause: any;
      returningList: any[];
      fromClause: any[];
      withClause: any;
    };
    DeleteStmt: {
      relation: any;
      whereClause: any;
      usingClause: any[];
      returningList: any[];
      withClause: any;
    };
    InsertStmt: {
      relation: any;
      selectStmt: any;
      override: any;
      cols: any[];
      onConflictClause: any;
      returningList: any[];
      withClause: any;
    };
    CreateSeqStmt: {sequence: any; options: any[]; if_not_exists: boolean};
    OnConflictClause: {
      action: Int;
      infer: any;
      targetList: any[];
      whereClause: any;
    };
    InferClause: {indexElems: any[]; conname: string; whereClause: any};
    MultiAssignRef: {source: any; colno: Int; ncolumns: Int};
    SetToDefault: {};
    MinMaxExpr: {op: Int; args: any[]};
    DropStmt: {
      objects: object[][];
      removeType: Int;
      behavior: Int;
      missing_ok: boolean;
      concurrent: boolean;
    };
    CreateTrigStmt: {
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
    };
    CompositeTypeStmt: {typevar: any; coldeflist: any[]};
    ExplainStmt: {query: any; options: any[]};
    ViewStmt: {
      view: any;
      query: any;
      withCheckOption: Int;
      replace: boolean;
      aliases: any[];
      options: any[];
    };
    CollateClause: {arg: any; collname: any[]};
    DefineStmt: {
      kind: Int;
      defnames: any[];
      args: object[][];
      definition: any[];
      oldstyle: boolean;
    };
    DropRoleStmt: {roles: any[]; missing_ok: boolean};
    AlterOwnerStmt: {objectType: Int; object: any; newowner: any};
    AlterObjectSchemaStmt: {
      objectType: Int;
      object: any;
      newschema: string;
      relation: any;
      missing_ok: boolean;
    };
    CreateConversionStmt: {
      conversion_name: any[];
      for_encoding_name: string;
      to_encoding_name: string;
      func_name: any[];
      def: boolean;
    };
    CreateFdwStmt: {fdwname: string; func_options: any[]; options: any[]};
    CreateForeignServerStmt: {
      servername: string;
      fdwname: string;
      options: any[];
      servertype: string;
      version: string;
    };
    CreatePLangStmt: {plname: string; plhandler: any[]};
    CreateOpFamilyStmt: {opfamilyname: any[]; amname: string};
    CreateOpClassStmt: {
      opclassname: any[];
      amname: string;
      datatype: any;
      items: any[];
      isDefault: boolean;
    };
    CreateOpClassItem: {
      itemtype: Int;
      storedtype: any;
      name: any;
      number: Int;
      class_args: any[];
      order_family: any[];
    };
    AlterOpFamilyStmt: {
      opfamilyname: any[];
      amname: string;
      items: any[];
      isDrop: boolean;
    };
    AlterOperatorStmt: {opername: any; options: any[]};
    VacuumStmt: {options: Int; relation: any; va_cols: any[]};
    CreateTableAsStmt: {
      query: any;
      into: any;
      relkind: Int;
      if_not_exists: boolean;
    };
    IntoClause: {
      rel: any;
      onCommit: Int;
      colNames: any[];
      skipData: boolean;
      options: any[];
    };
    CaseExpr: {args: any[]; defresult: any; arg: any};
    CaseWhen: {expr: any; result: any};
    BooleanTest: {arg: any; booltesttype: Int};
    AlterFunctionStmt: {func: any; actions: any[]};
    TruncateStmt: {relations: any[]; behavior: Int; restart_seqs: boolean};
    A_Indices: {is_slice: boolean; lidx: any; uidx: any};
    NotifyStmt: {conditionname: string};
    ListenStmt: {conditionname: string};
    UnlistenStmt: {conditionname: string};
    BitString: {str: string};
    CoalesceExpr: {args: any[]};
    ClusterStmt: {relation: any; indexname: string};
    TableLikeClause: {relation: any; options: Int};
    WithClause: {ctes: any[]; recursive: boolean};
    CommonTableExpr: {ctename: string; aliascolnames: any[]; ctequery: any};
    CreateRangeStmt: {typeName: any[]; params: any[]};
    DeclareCursorStmt: {portalname: string; options: Int; query: any};
    FetchStmt: {
      direction: Int;
      howMany: Int;
      portalname: string;
      ismove: boolean;
    };
    LockingClause: {strength: Int; waitPolicy: Int; lockedRels: any[]};
    CreateAmStmt: {amname: string; handler_name: any[]; amtype: string};
    CreateCastStmt: {
      sourcetype: any;
      targettype: any;
      context: Int;
      inout: boolean;
      func: any;
    };
    ReindexStmt: {kind: Int; relation: any; options: Int; name: string};
    DropOwnedStmt: {roles: any[]; behavior: Int};
    ReassignOwnedStmt: {roles: any[]; newrole: any};
    AlterSeqStmt: {sequence: any; options: any[]; missing_ok: boolean};
    AlterDomainStmt: {
      subtype: string;
      typeName: any[];
      behavior: Int;
      def: any;
      name: string;
      missing_ok: boolean;
    };
    PrepareStmt: {name: string; query: any; argtypes: any[]};
    ExecuteStmt: {name: string; params: any[]};
    AlterEnumStmt: {
      typeName: any[];
      newVal: string;
      newValIsAfter: boolean;
      newValNeighbor: string;
      skipIfNewValExists: boolean;
    };
    CreateEventTrigStmt: {
      trigname: string;
      eventname: string;
      funcname: any[];
      whenclause: any[];
    };
    AlterEventTrigStmt: {trigname: string; tgenabled: string};
    CreateUserMappingStmt: {user: any; servername: string; options: any[]};
    AlterRoleStmt: {role: any; options: any[]; action: Int};
    AlterPolicyStmt: {policy_name: string; table: any; qual: any};
    AlterFdwStmt: {fdwname: string; func_options: any[]; options: any[]};
    AlterForeignServerStmt: {
      servername: string;
      version: string;
      options: any[];
      has_version: boolean;
    };
    AlterUserMappingStmt: {user: any; servername: string; options: any[]};
    DropUserMappingStmt: {user: any; servername: string; missing_ok: boolean};
    CreateForeignTableStmt: {base: any; servername: string; options: any[]};
    ImportForeignSchemaStmt: {
      server_name: string;
      remote_schema: string;
      local_schema: string;
      list_type: Int;
      table_list: any[];
      options: any[];
    };
    ConstraintsSetStmt: {deferred: boolean};
    GroupingFunc: {args: any[]};
    GroupingSet: {kind: Int; content: any[]};
    WindowDef: {
      orderClause: any[];
      frameOptions: Int;
      partitionClause: any[];
      name: string;
      startOffset: any;
      endOffset: any;
    };
    DiscardStmt: {target: Int};
    LockStmt: {relations: any[]; mode: Int; nowait: boolean};
    AlterRoleSetStmt: {role: any; setstmt: any};
    RefreshMatViewStmt: {relation: any; concurrent: boolean; skipData: boolean};
    CreateTransformStmt: {
      type_name: any;
      lang: string;
      fromsql: any;
      tosql: any;
    };
    ClosePortalStmt: {portalname: string};
    CurrentOfExpr: {cursor_name: string};
    DeallocateStmt: {name: string};
    ReplicaIdentityStmt: {identity_type: string; name: string};
    RangeTableSample: {
      relation: any;
      method: any[];
      args: any[];
      repeatable: any;
    };
    SecLabelStmt: {
      objtype: Int;
      object: any[];
      label: string;
      provider: string;
    };
    CopyStmt: {query: any; filename: string};
    AlterTSConfigurationStmt: {
      kind: Int;
      cfgname: any[];
      tokentype: any[];
      dicts: object[][];
      override: boolean;
      replace: boolean;
    };
    XmlExpr: {
      op: Int;
      args: any[];
      name: string;
      xmloption: Int;
      named_args: any[];
    };
    XmlSerialize: {xmloption: Int; expr: any; typeName: any};
  };

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
}
