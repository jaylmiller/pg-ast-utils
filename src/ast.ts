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
  for (let [key, value] of Object.entries(node || {})) {
    if (Array.isArray(value)) for (let v of value) yield* traverse(v);
    else if (_isNodeType(key) && value) {
      assert(typeof value === 'object');
      yield {type: key, node: value} as PgAst.TraversedNode;
      yield* traverse(value);
    } else if (typeof value === 'object' && value !== null)
      yield* traverse(value);
  }
}
/**
 * return node in the foramt expected by pgsql-parser for deparsing
 * @param t
 * @param n
 */
export function createNode<T extends PgAst.AstNodeTypeName>(
  t: T,
  n: Partial<PgAst.AllAstNodes[T]>
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
  export interface Statement {
    RawStmt: RawStmt;
  }
  export type AstNodeTypeName = keyof AllAstNodes;
  export type AstNodeType = AllAstNodes[AstNodeTypeName];
  export type TraversedNode = {
    [K in keyof AllAstNodes]: {type: K; node: AllAstNodes[K]};
  }[keyof AllAstNodes];
  export type TypeToAstNode<T extends AstNodeTypeName> = {
    [K in keyof AllAstNodes as K extends T ? K : never]: Partial<
      AllAstNodes[K]
    >;
  };

  export interface RawStmt {
    stmt: {
      [K in keyof AllAstNodes as K extends `${string}Stmt`
        ? K
        : never]?: Partial<AllAstNodes[K]>;
    };
    stmt_len?: number;
  }
  export function getNodeType(n: any) {
    const ks = Object.keys(n);
    if (ks.length !== 1) return null;
    const k = ks[0];
    if (!_isNodeType(k)) return null;
    return k;
  }

  type AstNode = Partial<AllAstNodes>;
  // generated type
  export interface AllAstNodes {
    RawStmt: {
      stmt?: AstNode;
      stmt_location?: number;
      stmt_len?: number;
    };
    InsertStmt: {
      relation?: AllAstNodes['RangeVar'];
      cols?: AstNode[];
      selectStmt?: AstNode;
      onConflictClause?: AllAstNodes['OnConflictClause'];
      returningList?: AstNode[];
      withClause?: AllAstNodes['WithClause'];
      override?: any;
    };
    DeleteStmt: {
      relation?: AllAstNodes['RangeVar'];
      usingClause?: AstNode[];
      whereClause?: AstNode;
      returningList?: AstNode[];
      withClause?: AllAstNodes['WithClause'];
    };
    UpdateStmt: {
      relation?: AllAstNodes['RangeVar'];
      targetList?: AstNode[];
      whereClause?: AstNode;
      fromClause?: AstNode[];
      returningList?: AstNode[];
      withClause?: AllAstNodes['WithClause'];
    };
    SelectStmt: {
      distinctClause?: AstNode[];
      intoClause?: AllAstNodes['IntoClause'];
      targetList?: AstNode[];
      fromClause?: AstNode[];
      whereClause?: AstNode;
      groupClause?: AstNode[];
      havingClause?: AstNode;
      windowClause?: AstNode[];
      valuesLists?: AstNode[];
      sortClause?: AstNode[];
      limitOffset?: AstNode;
      limitCount?: AstNode;
      limitOption?: any;
      lockingClause?: AstNode[];
      withClause?: AllAstNodes['WithClause'];
      op?: any;
      all?: boolean;
      larg?: AllAstNodes['SelectStmt'];
      rarg?: AllAstNodes['SelectStmt'];
    };
    SetOperationStmt: {
      op?: any;
      all?: boolean;
      larg?: AstNode;
      rarg?: AstNode;
      colTypes?: AstNode[];
      colTypmods?: AstNode[];
      colCollations?: AstNode[];
      groupClauses?: AstNode[];
    };
    CreateSchemaStmt: {
      schemaname?: string;
      authrole?: AllAstNodes['RoleSpec'];
      schemaElts?: AstNode[];
      if_not_exists?: boolean;
    };
    AlterTableStmt: {
      relation?: AllAstNodes['RangeVar'];
      cmds?: AstNode[];
      relkind?: any;
      missing_ok?: boolean;
    };
    ReplicaIdentityStmt: {
      identity_type?: string;
      name?: string;
    };
    AlterCollationStmt: {
      collname?: AstNode[];
    };
    AlterDomainStmt: {
      subtype?: string;
      typeName?: AstNode[];
      name?: string;
      def?: AstNode;
      behavior?: any;
      missing_ok?: boolean;
    };
    GrantStmt: {
      is_grant?: boolean;
      targtype?: any;
      objtype?: any;
      objects?: AstNode[];
      privileges?: AstNode[];
      grantees?: AstNode[];
      grant_option?: boolean;
      behavior?: any;
    };
    GrantRoleStmt: {
      granted_roles?: AstNode[];
      grantee_roles?: AstNode[];
      is_grant?: boolean;
      admin_opt?: boolean;
      grantor?: AllAstNodes['RoleSpec'];
      behavior?: any;
    };
    AlterDefaultPrivilegesStmt: {
      options?: AstNode[];
      action?: AllAstNodes['GrantStmt'];
    };
    CopyStmt: {
      relation?: AllAstNodes['RangeVar'];
      query?: AstNode;
      attlist?: AstNode[];
      is_from?: boolean;
      is_program?: boolean;
      filename?: string;
      options?: AstNode[];
      whereClause?: AstNode;
    };
    VariableSetStmt: {
      kind?: any;
      name?: string;
      args?: AstNode[];
      is_local?: boolean;
    };
    VariableShowStmt: {
      name?: string;
    };
    CreateStmt: {
      relation?: AllAstNodes['RangeVar'];
      tableElts?: AstNode[];
      inhRelations?: AstNode[];
      partbound?: any;
      partspec?: AllAstNodes['PartitionSpec'];
      ofTypename?: AllAstNodes['TypeName'];
      constraints?: AstNode[];
      options?: AstNode[];
      oncommit?: any;
      tablespacename?: string;
      accessMethod?: string;
      if_not_exists?: boolean;
    };
    CreateTableSpaceStmt: {
      tablespacename?: string;
      owner?: AllAstNodes['RoleSpec'];
      location?: string;
      options?: AstNode[];
    };
    DropTableSpaceStmt: {
      tablespacename?: string;
      missing_ok?: boolean;
    };
    AlterTableSpaceOptionsStmt: {
      tablespacename?: string;
      options?: AstNode[];
      isReset?: boolean;
    };
    AlterTableMoveAllStmt: {
      orig_tablespacename?: string;
      objtype?: any;
      roles?: AstNode[];
      new_tablespacename?: string;
      nowait?: boolean;
    };
    CreateExtensionStmt: {
      extname?: string;
      if_not_exists?: boolean;
      options?: AstNode[];
    };
    AlterExtensionStmt: {
      extname?: string;
      options?: AstNode[];
    };
    AlterExtensionContentsStmt: {
      extname?: string;
      action?: number;
      objtype?: any;
      object?: AstNode;
    };
    CreateFdwStmt: {
      fdwname?: string;
      func_options?: AstNode[];
      options?: AstNode[];
    };
    AlterFdwStmt: {
      fdwname?: string;
      func_options?: AstNode[];
      options?: AstNode[];
    };
    CreateForeignServerStmt: {
      servername?: string;
      servertype?: string;
      version?: string;
      fdwname?: string;
      if_not_exists?: boolean;
      options?: AstNode[];
    };
    AlterForeignServerStmt: {
      servername?: string;
      version?: string;
      options?: AstNode[];
      has_version?: boolean;
    };
    CreateForeignTableStmt: {
      base?: AllAstNodes['CreateStmt'];
      servername?: string;
      options?: AstNode[];
    };
    CreateUserMappingStmt: {
      user?: AllAstNodes['RoleSpec'];
      servername?: string;
      if_not_exists?: boolean;
      options?: AstNode[];
    };
    AlterUserMappingStmt: {
      user?: AllAstNodes['RoleSpec'];
      servername?: string;
      options?: AstNode[];
    };
    DropUserMappingStmt: {
      user?: AllAstNodes['RoleSpec'];
      servername?: string;
      missing_ok?: boolean;
    };
    ImportForeignSchemaStmt: {
      server_name?: string;
      remote_schema?: string;
      local_schema?: string;
      list_type?: any;
      table_list?: AstNode[];
      options?: AstNode[];
    };
    CreatePolicyStmt: {
      policy_name?: string;
      table?: AllAstNodes['RangeVar'];
      cmd_name?: string;
      permissive?: boolean;
      roles?: AstNode[];
      qual?: AstNode;
      with_check?: AstNode;
    };
    AlterPolicyStmt: {
      policy_name?: string;
      table?: AllAstNodes['RangeVar'];
      roles?: AstNode[];
      qual?: AstNode;
      with_check?: AstNode;
    };
    CreateAmStmt: {
      amname?: string;
      handler_name?: AstNode[];
      amtype?: string;
    };
    CreateTrigStmt: {
      trigname?: string;
      relation?: AllAstNodes['RangeVar'];
      funcname?: AstNode[];
      args?: AstNode[];
      row?: boolean;
      timing?: number;
      events?: number;
      columns?: AstNode[];
      whenClause?: AstNode;
      isconstraint?: boolean;
      transitionRels?: AstNode[];
      deferrable?: boolean;
      initdeferred?: boolean;
      constrrel?: AllAstNodes['RangeVar'];
    };
    CreateEventTrigStmt: {
      trigname?: string;
      eventname?: string;
      whenclause?: AstNode[];
      funcname?: AstNode[];
    };
    AlterEventTrigStmt: {
      trigname?: string;
      tgenabled?: string;
    };
    CreatePLangStmt: {
      replace?: boolean;
      plname?: string;
      plhandler?: AstNode[];
      plinline?: AstNode[];
      plvalidator?: AstNode[];
      pltrusted?: boolean;
    };
    CreateRoleStmt: {
      stmt_type?: any;
      role?: string;
      options?: AstNode[];
    };
    AlterRoleStmt: {
      role?: AllAstNodes['RoleSpec'];
      options?: AstNode[];
      action?: number;
    };
    AlterRoleSetStmt: {
      role?: AllAstNodes['RoleSpec'];
      database?: string;
      setstmt?: AllAstNodes['VariableSetStmt'];
    };
    DropRoleStmt: {
      roles?: AstNode[];
      missing_ok?: boolean;
    };
    CreateSeqStmt: {
      sequence?: AllAstNodes['RangeVar'];
      options?: AstNode[];
      ownerId?: number;
      for_identity?: boolean;
      if_not_exists?: boolean;
    };
    AlterSeqStmt: {
      sequence?: AllAstNodes['RangeVar'];
      options?: AstNode[];
      for_identity?: boolean;
      missing_ok?: boolean;
    };
    DefineStmt: {
      kind?: any;
      oldstyle?: boolean;
      defnames?: AstNode[];
      args?: AstNode[];
      definition?: AstNode[];
      if_not_exists?: boolean;
      replace?: boolean;
    };
    CreateDomainStmt: {
      domainname?: AstNode[];
      typeName?: AllAstNodes['TypeName'];
      collClause?: AllAstNodes['CollateClause'];
      constraints?: AstNode[];
    };
    CreateOpClassStmt: {
      opclassname?: AstNode[];
      opfamilyname?: AstNode[];
      amname?: string;
      datatype?: AllAstNodes['TypeName'];
      items?: AstNode[];
      isDefault?: boolean;
    };
    CreateOpFamilyStmt: {
      opfamilyname?: AstNode[];
      amname?: string;
    };
    AlterOpFamilyStmt: {
      opfamilyname?: AstNode[];
      amname?: string;
      isDrop?: boolean;
      items?: AstNode[];
    };
    DropStmt: {
      objects?: AstNode[];
      removeType?: any;
      behavior?: any;
      missing_ok?: boolean;
      concurrent?: boolean;
    };
    TruncateStmt: {
      relations?: AstNode[];
      restart_seqs?: boolean;
      behavior?: any;
    };
    CommentStmt: {
      objtype?: any;
      object?: AstNode;
      comment?: string;
    };
    SecLabelStmt: {
      objtype?: any;
      object?: AstNode;
      provider?: string;
      label?: string;
    };
    DeclareCursorStmt: {
      portalname?: string;
      options?: number;
      query?: AstNode;
    };
    ClosePortalStmt: {
      portalname?: string;
    };
    FetchStmt: {
      direction?: any;
      howMany?: number;
      portalname?: string;
      ismove?: boolean;
    };
    IndexStmt: {
      idxname?: string;
      relation?: AllAstNodes['RangeVar'];
      accessMethod?: string;
      tableSpace?: string;
      indexParams?: AstNode[];
      indexIncludingParams?: AstNode[];
      options?: AstNode[];
      whereClause?: AstNode;
      excludeOpNames?: AstNode[];
      idxcomment?: string;
      indexOid?: number;
      oldNode?: number;
      oldCreateSubid?: any;
      oldFirstRelfilenodeSubid?: any;
      unique?: boolean;
      primary?: boolean;
      isconstraint?: boolean;
      deferrable?: boolean;
      initdeferred?: boolean;
      transformed?: boolean;
      concurrent?: boolean;
      if_not_exists?: boolean;
      reset_default_tblspc?: boolean;
    };
    CreateStatsStmt: {
      defnames?: AstNode[];
      stat_types?: AstNode[];
      exprs?: AstNode[];
      relations?: AstNode[];
      stxcomment?: string;
      if_not_exists?: boolean;
    };
    AlterStatsStmt: {
      defnames?: AstNode[];
      stxstattarget?: number;
      missing_ok?: boolean;
    };
    CreateFunctionStmt: {
      is_procedure?: boolean;
      replace?: boolean;
      funcname?: AstNode[];
      parameters?: AstNode[];
      returnType?: AllAstNodes['TypeName'];
      options?: AstNode[];
    };
    AlterFunctionStmt: {
      objtype?: any;
      func?: AllAstNodes['ObjectWithArgs'];
      actions?: AstNode[];
    };
    DoStmt: {
      args?: AstNode[];
    };
    CallStmt: {
      funccall?: AllAstNodes['FuncCall'];
      funcexpr?: AllAstNodes['FuncExpr'];
    };
    RenameStmt: {
      renameType?: any;
      relationType?: any;
      relation?: AllAstNodes['RangeVar'];
      object?: AstNode;
      subname?: string;
      newname?: string;
      behavior?: any;
      missing_ok?: boolean;
    };
    AlterObjectDependsStmt: {
      objectType?: any;
      relation?: AllAstNodes['RangeVar'];
      object?: AstNode;
      extname?: any;
      remove?: boolean;
    };
    AlterObjectSchemaStmt: {
      objectType?: any;
      relation?: AllAstNodes['RangeVar'];
      object?: AstNode;
      newschema?: string;
      missing_ok?: boolean;
    };
    AlterOwnerStmt: {
      objectType?: any;
      relation?: AllAstNodes['RangeVar'];
      object?: AstNode;
      newowner?: AllAstNodes['RoleSpec'];
    };
    AlterOperatorStmt: {
      opername?: AllAstNodes['ObjectWithArgs'];
      options?: AstNode[];
    };
    AlterTypeStmt: {
      typeName?: AstNode[];
      options?: AstNode[];
    };
    RuleStmt: {
      relation?: AllAstNodes['RangeVar'];
      rulename?: string;
      whereClause?: AstNode;
      event?: string;
      instead?: boolean;
      actions?: AstNode[];
      replace?: boolean;
    };
    NotifyStmt: {
      conditionname?: string;
      payload?: string;
    };
    ListenStmt: {
      conditionname?: string;
    };
    UnlistenStmt: {
      conditionname?: string;
    };
    TransactionStmt: {
      kind?: any;
      options?: AstNode[];
      savepoint_name?: string;
      gid?: string;
      chain?: boolean;
    };
    CompositeTypeStmt: {
      typevar?: AllAstNodes['RangeVar'];
      coldeflist?: AstNode[];
    };
    CreateEnumStmt: {
      typeName?: AstNode[];
      vals?: AstNode[];
    };
    CreateRangeStmt: {
      typeName?: AstNode[];
      params?: AstNode[];
    };
    AlterEnumStmt: {
      typeName?: AstNode[];
      oldVal?: string;
      newVal?: string;
      newValNeighbor?: string;
      newValIsAfter?: boolean;
      skipIfNewValExists?: boolean;
    };
    ViewStmt: {
      view?: AllAstNodes['RangeVar'];
      aliases?: AstNode[];
      query?: AstNode;
      replace?: boolean;
      options?: AstNode[];
      withCheckOption?: any;
    };
    LoadStmt: {
      filename?: string;
    };
    CreatedbStmt: {
      dbname?: string;
      options?: AstNode[];
    };
    AlterDatabaseStmt: {
      dbname?: string;
      options?: AstNode[];
    };
    AlterDatabaseSetStmt: {
      dbname?: string;
      setstmt?: AllAstNodes['VariableSetStmt'];
    };
    DropdbStmt: {
      dbname?: string;
      missing_ok?: boolean;
      options?: AstNode[];
    };
    AlterSystemStmt: {
      setstmt?: AllAstNodes['VariableSetStmt'];
    };
    ClusterStmt: {
      relation?: AllAstNodes['RangeVar'];
      indexname?: string;
      options?: number;
    };
    VacuumStmt: {
      options?: AstNode[];
      rels?: AstNode[];
      is_vacuumcmd?: boolean;
    };
    ExplainStmt: {
      query?: AstNode;
      options?: AstNode[];
    };
    CreateTableAsStmt: {
      query?: AstNode;
      into?: AllAstNodes['IntoClause'];
      relkind?: any;
      is_select_into?: boolean;
      if_not_exists?: boolean;
    };
    RefreshMatViewStmt: {
      concurrent?: boolean;
      skipData?: boolean;
      relation?: AllAstNodes['RangeVar'];
    };
    CheckPointStmt: {};
    DiscardStmt: {
      target?: any;
    };
    LockStmt: {
      relations?: AstNode[];
      mode?: number;
      nowait?: boolean;
    };
    ConstraintsSetStmt: {
      constraints?: AstNode[];
      deferred?: boolean;
    };
    ReindexStmt: {
      kind?: any;
      relation?: AllAstNodes['RangeVar'];
      options?: number;
      concurrent?: boolean;
    };
    CreateConversionStmt: {
      conversion_name?: AstNode[];
      for_encoding_name?: string;
      to_encoding_name?: string;
      func_name?: AstNode[];
      def?: boolean;
    };
    CreateCastStmt: {
      sourcetype?: AllAstNodes['TypeName'];
      targettype?: AllAstNodes['TypeName'];
      func?: AllAstNodes['ObjectWithArgs'];
      context?: any;
      inout?: boolean;
    };
    CreateTransformStmt: {
      replace?: boolean;
      type_name?: AllAstNodes['TypeName'];
      lang?: string;
      fromsql?: AllAstNodes['ObjectWithArgs'];
      tosql?: AllAstNodes['ObjectWithArgs'];
    };
    PrepareStmt: {
      name?: string;
      argtypes?: AstNode[];
      query?: AstNode;
    };
    ExecuteStmt: {
      name?: string;
      params?: AstNode[];
    };
    DeallocateStmt: {
      name?: string;
    };
    DropOwnedStmt: {
      roles?: AstNode[];
      behavior?: any;
    };
    ReassignOwnedStmt: {
      roles?: AstNode[];
      newrole?: AllAstNodes['RoleSpec'];
    };
    AlterTSDictionaryStmt: {
      dictname?: AstNode[];
      options?: AstNode[];
    };
    AlterTSConfigurationStmt: {
      kind?: any;
      cfgname?: AstNode[];
      tokentype?: AstNode[];
      dicts?: AstNode[];
      override?: boolean;
      replace?: boolean;
      missing_ok?: boolean;
    };
    CreatePublicationStmt: {
      pubname?: string;
      options?: AstNode[];
      tables?: AstNode[];
      for_all_tables?: boolean;
    };
    AlterPublicationStmt: {
      pubname?: string;
      options?: AstNode[];
      tables?: AstNode[];
      for_all_tables?: boolean;
      tableAction?: any;
    };
    CreateSubscriptionStmt: {
      subname?: string;
      conninfo?: string;
      publication?: AstNode[];
      options?: AstNode[];
    };
    AlterSubscriptionStmt: {
      kind?: any;
      subname?: string;
      conninfo?: string;
      publication?: AstNode[];
      options?: AstNode[];
    };
    DropSubscriptionStmt: {
      subname?: string;
      missing_ok?: boolean;
      behavior?: any;
    };
    TypeName: {
      names?: AstNode[];
      typeOid?: number;
      setof?: boolean;
      pct_type?: boolean;
      typmods?: AstNode[];
      typemod?: number;
      arrayBounds?: AstNode[];
      location?: number;
    };
    ColumnRef: {
      fields?: AstNode[];
      location?: number;
    };
    ParamRef: {
      number?: number;
      location?: number;
    };
    A_Expr: {
      kind?: any;
      name?: AstNode[];
      lexpr?: AstNode;
      rexpr?: AstNode;
      location?: number;
    };
    A_Const: {
      val?: any;
      location?: number;
    };
    TypeCast: {
      arg?: AstNode;
      typeName?: AllAstNodes['TypeName'];
      location?: number;
    };
    CollateClause: {
      arg?: AstNode;
      collname?: AstNode[];
      location?: number;
    };
    RoleSpec: {
      roletype?: any;
      rolename?: string;
      location?: number;
    };
    FuncCall: {
      funcname?: AstNode[];
      args?: AstNode[];
      agg_order?: AstNode[];
      agg_filter?: AstNode;
      agg_within_group?: boolean;
      agg_star?: boolean;
      agg_distinct?: boolean;
      func_variadic?: boolean;
      over?: AllAstNodes['WindowDef'];
      location?: number;
    };
    A_Star: {};
    A_Indices: {
      is_slice?: boolean;
      lidx?: AstNode;
      uidx?: AstNode;
    };
    A_Indirection: {
      arg?: AstNode;
      indirection?: AstNode[];
    };
    A_ArrayExpr: {
      elements?: AstNode[];
      location?: number;
    };
    ResTarget: {
      name?: string;
      indirection?: AstNode[];
      val?: AstNode;
      location?: number;
    };
    MultiAssignRef: {
      source?: AstNode;
      colno?: number;
      ncolumns?: number;
    };
    SortBy: {
      node?: AstNode;
      sortby_dir?: any;
      sortby_nulls?: any;
      useOp?: AstNode[];
      location?: number;
    };
    WindowDef: {
      name?: string;
      refname?: string;
      partitionClause?: AstNode[];
      orderClause?: AstNode[];
      frameOptions?: number;
      startOffset?: AstNode;
      endOffset?: AstNode;
      location?: number;
    };
    RangeSubselect: {
      lateral?: boolean;
      subquery?: AstNode;
      alias?: AllAstNodes['Alias'];
    };
    RangeFunction: {
      lateral?: boolean;
      ordinality?: boolean;
      is_rowsfrom?: boolean;
      functions?: AstNode[];
      alias?: AllAstNodes['Alias'];
      coldeflist?: AstNode[];
    };
    RangeTableFunc: {
      lateral?: boolean;
      docexpr?: AstNode;
      rowexpr?: AstNode;
      namespaces?: AstNode[];
      columns?: AstNode[];
      alias?: AllAstNodes['Alias'];
      location?: number;
    };
    RangeTableFuncCol: {
      colname?: string;
      typeName?: AllAstNodes['TypeName'];
      for_ordinality?: boolean;
      is_not_null?: boolean;
      colexpr?: AstNode;
      coldefexpr?: AstNode;
      location?: number;
    };
    RangeTableSample: {
      relation?: AstNode;
      method?: AstNode[];
      args?: AstNode[];
      repeatable?: AstNode;
      location?: number;
    };
    ColumnDef: {
      colname?: string;
      typeName?: AllAstNodes['TypeName'];
      inhcount?: number;
      is_local?: boolean;
      is_not_null?: boolean;
      is_from_type?: boolean;
      storage?: string;
      raw_default?: AstNode;
      cooked_default?: AstNode;
      identity?: string;
      identitySequence?: AllAstNodes['RangeVar'];
      generated?: string;
      collClause?: AllAstNodes['CollateClause'];
      collOid?: number;
      constraints?: AstNode[];
      fdwoptions?: AstNode[];
      location?: number;
    };
    TableLikeClause: {
      relation?: AllAstNodes['RangeVar'];
      options?: any;
      relationOid?: number;
    };
    IndexElem: {
      name?: string;
      expr?: AstNode;
      indexcolname?: string;
      collation?: AstNode[];
      opclass?: AstNode[];
      opclassopts?: AstNode[];
      ordering?: any;
      nulls_ordering?: any;
    };
    DefElem: {
      defnamespace?: string;
      defname?: string;
      arg?: AstNode;
      defaction?: any;
      location?: number;
    };
    LockingClause: {
      lockedRels?: AstNode[];
      strength?: any;
      waitPolicy?: any;
    };
    XmlSerialize: {
      xmloption?: any;
      expr?: AstNode;
      typeName?: AllAstNodes['TypeName'];
      location?: number;
    };
    PartitionElem: {
      name?: string;
      expr?: AstNode;
      collation?: AstNode[];
      opclass?: AstNode[];
      location?: number;
    };
    PartitionSpec: {
      strategy?: string;
      partParams?: AstNode[];
      location?: number;
    };
    PartitionRangeDatum: {
      kind?: any;
      value?: AstNode;
      location?: number;
    };
    PartitionCmd: {
      name?: AllAstNodes['RangeVar'];
      bound?: any;
    };
    RangeTblEntry: {
      rtekind?: any;
      relid?: number;
      relkind?: string;
      rellockmode?: number;
      tablesample?: AllAstNodes['TableSampleClause'];
      subquery?: any;
      security_barrier?: boolean;
      jointype?: any;
      joinmergedcols?: number;
      joinaliasvars?: AstNode[];
      joinleftcols?: AstNode[];
      joinrightcols?: AstNode[];
      functions?: AstNode[];
      funcordinality?: boolean;
      tablefunc?: AllAstNodes['TableFunc'];
      values_lists?: AstNode[];
      ctename?: string;
      ctelevelsup?: any;
      self_reference?: boolean;
      coltypes?: AstNode[];
      coltypmods?: AstNode[];
      colcollations?: AstNode[];
      enrname?: string;
      enrtuples?: any;
      alias?: AllAstNodes['Alias'];
      eref?: AllAstNodes['Alias'];
      lateral?: boolean;
      inh?: boolean;
      inFromCl?: boolean;
      requiredPerms?: any;
      checkAsUser?: number;
      selectedCols?: any;
      insertedCols?: any;
      updatedCols?: any;
      extraUpdatedCols?: any;
      securityQuals?: AstNode[];
    };
    RangeTblFunction: {
      funcexpr?: AstNode;
      funccolcount?: number;
      funccolnames?: AstNode[];
      funccoltypes?: AstNode[];
      funccoltypmods?: AstNode[];
      funccolcollations?: AstNode[];
      funcparams?: any;
    };
    TableSampleClause: {
      tsmhandler?: number;
      args?: AstNode[];
      repeatable?: any;
    };
    WithCheckOption: {
      kind?: any;
      relname?: string;
      polname?: string;
      qual?: AstNode;
      cascaded?: boolean;
    };
    SortGroupClause: {
      tleSortGroupRef?: any;
      eqop?: number;
      sortop?: number;
      nulls_first?: boolean;
      hashable?: boolean;
    };
    GroupingSet: {
      kind?: any;
      content?: AstNode[];
      location?: number;
    };
    WindowClause: {
      name?: string;
      refname?: string;
      partitionClause?: AstNode[];
      orderClause?: AstNode[];
      frameOptions?: number;
      startOffset?: AstNode;
      endOffset?: AstNode;
      startInRangeFunc?: number;
      endInRangeFunc?: number;
      inRangeColl?: number;
      inRangeAsc?: boolean;
      inRangeNullsFirst?: boolean;
      winref?: any;
      copiedOrder?: boolean;
    };
    RowMarkClause: {
      rti?: any;
      strength?: any;
      waitPolicy?: any;
      pushedDown?: boolean;
    };
    WithClause: {
      ctes?: AstNode[];
      recursive?: boolean;
      location?: number;
    };
    InferClause: {
      indexElems?: AstNode[];
      whereClause?: AstNode;
      conname?: string;
      location?: number;
    };
    OnConflictClause: {
      action?: any;
      infer?: AllAstNodes['InferClause'];
      targetList?: AstNode[];
      whereClause?: AstNode;
      location?: number;
    };
    CommonTableExpr: {
      ctename?: string;
      aliascolnames?: AstNode[];
      ctematerialized?: any;
      ctequery?: AstNode;
      location?: number;
      cterecursive?: boolean;
      cterefcount?: number;
      ctecolnames?: AstNode[];
      ctecoltypes?: AstNode[];
      ctecoltypmods?: AstNode[];
      ctecolcollations?: AstNode[];
    };
    TriggerTransition: {
      name?: string;
      isNew?: boolean;
      isTable?: boolean;
    };
    AlterTableCmd: {
      subtype?: any;
      name?: string;
      num?: number;
      newowner?: AllAstNodes['RoleSpec'];
      def?: AstNode;
      behavior?: any;
      missing_ok?: boolean;
      recurse?: boolean;
    };
    ObjectWithArgs: {
      objname?: AstNode[];
      objargs?: AstNode[];
      args_unspecified?: boolean;
    };
    AccessPriv: {
      priv_name?: string;
      cols?: AstNode[];
    };
    Constraint: {
      contype?: any;
      conname?: string;
      deferrable?: boolean;
      initdeferred?: boolean;
      location?: number;
      is_no_inherit?: boolean;
      raw_expr?: AstNode;
      cooked_expr?: string;
      generated_when?: string;
      keys?: AstNode[];
      including?: AstNode[];
      exclusions?: AstNode[];
      options?: AstNode[];
      indexname?: string;
      indexspace?: string;
      reset_default_tblspc?: boolean;
      access_method?: string;
      where_clause?: AstNode;
      pktable?: AllAstNodes['RangeVar'];
      fk_attrs?: AstNode[];
      pk_attrs?: AstNode[];
      fk_matchtype?: string;
      fk_upd_action?: string;
      fk_del_action?: string;
      old_conpfeqop?: AstNode[];
      old_pktable_oid?: number;
      skip_validation?: boolean;
      initially_valid?: boolean;
    };
    CreateOpClassItem: {
      itemtype?: number;
      name?: AllAstNodes['ObjectWithArgs'];
      number?: number;
      order_family?: AstNode[];
      class_args?: AstNode[];
      storedtype?: AllAstNodes['TypeName'];
    };
    FunctionParameter: {
      name?: string;
      argType?: AllAstNodes['TypeName'];
      mode?: any;
      defexpr?: AstNode;
    };
    InlineCodeBlock: {
      source_text?: string;
      langOid?: number;
      langIsTrusted?: boolean;
      atomic?: boolean;
    };
    CallContext: {
      atomic?: boolean;
    };
    VacuumRelation: {
      relation?: AllAstNodes['RangeVar'];
      oid?: number;
      va_cols?: AstNode[];
    };
    String: {
      ival?: number;
      str?: string;
    };
    Integer: {
      ival?: number;
      str?: string;
    };
    Float: {
      ival?: number;
      str?: string;
    };
    Null: {
      ival?: number;
      str?: string;
    };
    BitString: {
      ival?: number;
      str?: string;
    };
    Alias: {
      aliasname?: string;
      colnames?: AstNode[];
    };
    RangeVar: {
      catalogname?: string;
      schemaname?: string;
      relname?: string;
      inh?: boolean;
      relpersistence?: string;
      alias?: AllAstNodes['Alias'];
      location?: number;
    };
    TableFunc: {
      ns_uris?: AstNode[];
      ns_names?: AstNode[];
      docexpr?: AstNode;
      rowexpr?: AstNode;
      colnames?: AstNode[];
      coltypes?: AstNode[];
      coltypmods?: AstNode[];
      colcollations?: AstNode[];
      colexprs?: AstNode[];
      coldefexprs?: AstNode[];
      notnulls?: any;
      ordinalitycol?: number;
      location?: number;
    };
    IntoClause: {
      rel?: AllAstNodes['RangeVar'];
      colNames?: AstNode[];
      accessMethod?: string;
      options?: AstNode[];
      onCommit?: any;
      tableSpaceName?: string;
      viewQuery?: AstNode;
      skipData?: boolean;
    };
    FuncExpr: {
      xpr?: any;
      funcid?: number;
      funcresulttype?: number;
      funcretset?: boolean;
      funcvariadic?: boolean;
      funcformat?: any;
      funccollid?: number;
      inputcollid?: number;
      args?: AstNode[];
      location?: number;
    };
  }

  export const AST_TYPES: AstNodeTypeName[] = [
    'RawStmt',
    'InsertStmt',
    'DeleteStmt',
    'UpdateStmt',
    'SelectStmt',
    'SetOperationStmt',
    'CreateSchemaStmt',
    'AlterTableStmt',
    'ReplicaIdentityStmt',
    'AlterCollationStmt',
    'AlterDomainStmt',
    'GrantStmt',
    'GrantRoleStmt',
    'AlterDefaultPrivilegesStmt',
    'CopyStmt',
    'VariableSetStmt',
    'VariableShowStmt',
    'CreateStmt',
    'CreateTableSpaceStmt',
    'DropTableSpaceStmt',
    'AlterTableSpaceOptionsStmt',
    'AlterTableMoveAllStmt',
    'CreateExtensionStmt',
    'AlterExtensionStmt',
    'AlterExtensionContentsStmt',
    'CreateFdwStmt',
    'AlterFdwStmt',
    'CreateForeignServerStmt',
    'AlterForeignServerStmt',
    'CreateForeignTableStmt',
    'CreateUserMappingStmt',
    'AlterUserMappingStmt',
    'DropUserMappingStmt',
    'ImportForeignSchemaStmt',
    'CreatePolicyStmt',
    'AlterPolicyStmt',
    'CreateAmStmt',
    'CreateTrigStmt',
    'CreateEventTrigStmt',
    'AlterEventTrigStmt',
    'CreatePLangStmt',
    'CreateRoleStmt',
    'AlterRoleStmt',
    'AlterRoleSetStmt',
    'DropRoleStmt',
    'CreateSeqStmt',
    'AlterSeqStmt',
    'DefineStmt',
    'CreateDomainStmt',
    'CreateOpClassStmt',
    'CreateOpFamilyStmt',
    'AlterOpFamilyStmt',
    'DropStmt',
    'TruncateStmt',
    'CommentStmt',
    'SecLabelStmt',
    'DeclareCursorStmt',
    'ClosePortalStmt',
    'FetchStmt',
    'IndexStmt',
    'CreateStatsStmt',
    'AlterStatsStmt',
    'CreateFunctionStmt',
    'AlterFunctionStmt',
    'DoStmt',
    'CallStmt',
    'RenameStmt',
    'AlterObjectDependsStmt',
    'AlterObjectSchemaStmt',
    'AlterOwnerStmt',
    'AlterOperatorStmt',
    'AlterTypeStmt',
    'RuleStmt',
    'NotifyStmt',
    'ListenStmt',
    'UnlistenStmt',
    'TransactionStmt',
    'CompositeTypeStmt',
    'CreateEnumStmt',
    'CreateRangeStmt',
    'AlterEnumStmt',
    'ViewStmt',
    'LoadStmt',
    'CreatedbStmt',
    'AlterDatabaseStmt',
    'AlterDatabaseSetStmt',
    'DropdbStmt',
    'AlterSystemStmt',
    'ClusterStmt',
    'VacuumStmt',
    'ExplainStmt',
    'CreateTableAsStmt',
    'RefreshMatViewStmt',
    'CheckPointStmt',
    'DiscardStmt',
    'LockStmt',
    'ConstraintsSetStmt',
    'ReindexStmt',
    'CreateConversionStmt',
    'CreateCastStmt',
    'CreateTransformStmt',
    'PrepareStmt',
    'ExecuteStmt',
    'DeallocateStmt',
    'DropOwnedStmt',
    'ReassignOwnedStmt',
    'AlterTSDictionaryStmt',
    'AlterTSConfigurationStmt',
    'CreatePublicationStmt',
    'AlterPublicationStmt',
    'CreateSubscriptionStmt',
    'AlterSubscriptionStmt',
    'DropSubscriptionStmt',
    'TypeName',
    'ColumnRef',
    'ParamRef',
    'A_Expr',
    'A_Const',
    'TypeCast',
    'CollateClause',
    'RoleSpec',
    'FuncCall',
    'A_Star',
    'A_Indices',
    'A_Indirection',
    'A_ArrayExpr',
    'ResTarget',
    'MultiAssignRef',
    'SortBy',
    'WindowDef',
    'RangeSubselect',
    'RangeFunction',
    'RangeTableFunc',
    'RangeTableFuncCol',
    'RangeTableSample',
    'ColumnDef',
    'TableLikeClause',
    'IndexElem',
    'DefElem',
    'LockingClause',
    'XmlSerialize',
    'PartitionElem',
    'PartitionSpec',
    'PartitionRangeDatum',
    'PartitionCmd',
    'RangeTblEntry',
    'RangeTblFunction',
    'TableSampleClause',
    'WithCheckOption',
    'SortGroupClause',
    'GroupingSet',
    'WindowClause',
    'RowMarkClause',
    'WithClause',
    'InferClause',
    'OnConflictClause',
    'CommonTableExpr',
    'TriggerTransition',
    'AlterTableCmd',
    'ObjectWithArgs',
    'AccessPriv',
    'Constraint',
    'CreateOpClassItem',
    'FunctionParameter',
    'InlineCodeBlock',
    'CallContext',
    'VacuumRelation',
    'String',
    'Integer',
    'Float',
    'Null',
    'BitString',
    'Alias',
    'RangeVar',
    'TableFunc',
    'IntoClause',
    'FuncExpr'
  ];
}
