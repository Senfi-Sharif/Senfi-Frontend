import React, { useMemo, useState, useEffect } from 'react';
import type { UniversityPublicationCategory, UniversityPublication } from '../hooks/useExcelData';

const toPersianDigits = (value: string | number): string => {
  const persianMap = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return value
    .toString()
    .replace(/[0-9]/g, (digit) => persianMap[parseInt(digit, 10)]);
};

interface FilterTreeProps {
  categories: UniversityPublicationCategory[];
  selectedPaths: Set<string>;
  onSelectionChange: (selectedPaths: Set<string>) => void;
  defaultSelectAll?: boolean;
}

interface TreeNode {
  name: string;
  path: string;
  fullPath: string;
  children: Map<string, TreeNode>;
  publications: UniversityPublication[];
  isPublication: boolean;
}

function buildFilterTree(categories: UniversityPublicationCategory[]): Map<string, TreeNode> {
  const root = new Map<string, TreeNode>();

  categories.forEach((category) => {
    // اضافه کردن دسته‌بندی اصلی
    if (!root.has(category.name)) {
      root.set(category.name, {
        name: category.name,
        path: category.name,
        fullPath: category.name,
        children: new Map(),
        publications: [],
        isPublication: false,
      });
    }
    const categoryNode = root.get(category.name)!;

    category.publications.forEach((publication) => {
      let currentNode = categoryNode;

      // اضافه کردن مسیرهای subcategory
      publication.pathSegments.slice(1, -1).forEach((segment, index) => {
        const pathSoFar = publication.pathSegments.slice(0, index + 2).join('/');
        if (!currentNode.children.has(segment)) {
          currentNode.children.set(segment, {
            name: segment,
            path: segment,
            fullPath: pathSoFar,
            children: new Map(),
            publications: [],
            isPublication: false,
          });
        }
        currentNode = currentNode.children.get(segment)!;
      });

      // اضافه کردن نشریه
      const publicationPath = publication.pathSegments.join('/');
      if (!currentNode.children.has(publication.name)) {
        currentNode.children.set(publication.name, {
          name: publication.name,
          path: publication.name,
          fullPath: publicationPath,
          children: new Map(),
          publications: [publication],
          isPublication: true,
        });
      } else {
        currentNode.children.get(publication.name)!.publications.push(publication);
      }
    });
  });

  return root;
}

function getAllDescendantPaths(node: TreeNode): string[] {
  // فقط descendantها را برمی‌گرداند، نه خود node را
  const paths: string[] = [];
  node.children.forEach((child) => {
    paths.push(child.fullPath);
    paths.push(...getAllDescendantPaths(child));
  });
  return paths;
}

export default function PublicationFilterTree({
  categories,
  selectedPaths,
  onSelectionChange,
  defaultSelectAll = false,
}: FilterTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const tree = useMemo(() => buildFilterTree(categories), [categories]);

  // به صورت پیش‌فرض همه را انتخاب می‌کنیم
  useEffect(() => {
    if (defaultSelectAll && !initialized && selectedPaths.size === 0 && tree.size > 0) {
      const allPaths = new Set<string>();
      tree.forEach((node) => {
        // اضافه کردن مسیر خود node
        allPaths.add(node.fullPath);
        // اضافه کردن تمام descendantها
        getAllDescendantPaths(node).forEach((path) => allPaths.add(path));
      });
      onSelectionChange(allPaths);
      setInitialized(true);
    }
  }, [defaultSelectAll, initialized, selectedPaths.size, tree, onSelectionChange]);

  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  // پیدا کردن تمام ancestorهای یک node
  const getAllAncestorPaths = (nodePath: string): string[] => {
    const parts = nodePath.split('/');
    const ancestors: string[] = [];
    for (let i = parts.length - 1; i > 0; i--) {
      ancestors.push(parts.slice(0, i).join('/'));
    }
    return ancestors;
  };

  // بررسی اینکه آیا یک node باید در selectedPaths باشد یا نه
  const shouldNodeBeSelected = (nodePath: string, currentSelection: Set<string>): boolean => {
    // پیدا کردن node در tree
    const findNodeByPath = (path: string, nodes: Map<string, TreeNode>): TreeNode | null => {
      for (const node of nodes.values()) {
        if (node.fullPath === path) {
          return node;
        }
        const found = findNodeByPath(path, node.children);
        if (found) return found;
      }
      return null;
    };

    const node = findNodeByPath(nodePath, tree);
    if (!node) return false;

    // اگر node هیچ childی ندارد، فقط بررسی می‌کنیم که آیا خودش در selectedPaths است
    if (node.children.size === 0) {
      return currentSelection.has(nodePath);
    }

    // اگر node child دارد، باید تمام descendantهایش در selectedPaths باشند
    const descendantPaths = getAllDescendantPaths(node);
    const allDescendantsSelected = descendantPaths.every((path) => currentSelection.has(path));
    return allDescendantsSelected && currentSelection.has(nodePath);
  };

  const toggleSelection = (node: TreeNode, checked: boolean) => {
    const newSelection = new Set(selectedPaths);
    const pathsToToggle = getAllDescendantPaths(node);

    if (checked) {
      // وقتی check می‌کنیم، مسیر خود node و تمام descendantهایش را اضافه می‌کنیم
      newSelection.add(node.fullPath);
      pathsToToggle.forEach((path) => newSelection.add(path));
    } else {
      // وقتی uncheck می‌کنیم، مسیر خود node و تمام descendantهایش را حذف می‌کنیم
      newSelection.delete(node.fullPath);
      pathsToToggle.forEach((path) => newSelection.delete(path));
    }

    // بررسی ancestorها و حذف آنها از selectedPaths اگر لازم باشد
    const ancestorPaths = getAllAncestorPaths(node.fullPath);
    ancestorPaths.forEach((ancestorPath) => {
      if (!shouldNodeBeSelected(ancestorPath, newSelection)) {
        newSelection.delete(ancestorPath);
      }
    });

    onSelectionChange(newSelection);
  };

  const isNodeSelected = (node: TreeNode): boolean => {
    // یک node انتخاب شده است اگر:
    // 1. مسیر خودش در selectedPaths باشد
    // 2. و تمام descendantهایش هم در selectedPaths باشند
    if (!selectedPaths.has(node.fullPath)) {
      return false;
    }
    const descendantPaths = getAllDescendantPaths(node);
    return descendantPaths.every((path) => selectedPaths.has(path));
  };

  const isNodePartiallySelected = (node: TreeNode): boolean => {
    // یک node به صورت جزئی انتخاب شده است اگر:
    // 1. مسیر خودش در selectedPaths باشد
    // 2. اما بعضی از descendantهایش در selectedPaths نباشند
    if (!selectedPaths.has(node.fullPath)) {
      return false;
    }
    const descendantPaths = getAllDescendantPaths(node);
    const selectedCount = descendantPaths.filter((path) => selectedPaths.has(path)).length;
    return selectedCount > 0 && selectedCount < descendantPaths.length;
  };

  const renderNode = (node: TreeNode, level: number = 0): React.ReactNode => {
    const hasChildren = node.children.size > 0;
    const isExpanded = expandedNodes.has(node.fullPath);
    const isSelected = isNodeSelected(node);
    const isPartiallySelected = isNodePartiallySelected(node);
    return (
      <div key={node.fullPath}>
        <div
          className={level > 0 ? 'publication-filter-tree-node publication-filter-tree-node-subfolder' : 'publication-filter-tree-node'}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '6px 8px',
            cursor: 'pointer',
            borderRadius: '4px',
            transition: 'background-color 0.2s',
            backgroundColor: level > 0 ? 'rgba(32, 118, 255, 0.02)' : 'transparent',
            borderLeft: level > 0 ? '2px solid rgba(32, 118, 255, 0.1)' : 'none',
            marginBottom: '2px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = level > 0 
              ? 'rgba(32, 118, 255, 0.05)' 
              : 'rgba(32, 118, 255, 0.03)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = level > 0 
              ? 'rgba(32, 118, 255, 0.02)' 
              : 'transparent';
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.fullPath);
              }}
              className="publication-filter-tree-expand-button"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 6px',
                fontSize: '11px',
                marginRight: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '3px',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(32, 118, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && <span style={{ width: '26px', display: 'inline-block' }} />}
          <input
            type="checkbox"
            checked={isSelected}
            ref={(input) => {
              if (input) input.indeterminate = isPartiallySelected;
            }}
            onChange={(e) => {
              e.stopPropagation();
              toggleSelection(node, e.target.checked);
            }}
            onClick={(e) => e.stopPropagation()}
            style={{ 
              marginRight: '10px', 
              cursor: 'pointer',
              width: '16px',
              height: '16px',
            }}
          />
          <span
            className={`publication-filter-tree-node-text publication-filter-tree-node-text-level-${level}`}
            onClick={() => hasChildren && toggleNode(node.fullPath)}
            style={{ 
              cursor: hasChildren ? 'pointer' : 'default', 
              flex: 1,
              fontSize: level === 0 ? '15px' : level === 1 ? '14px' : '13px',
              fontWeight: level === 0 ? '600' : level === 1 ? '500' : '400',
            }}
          >
            {node.name}
            {node.isPublication && (
              <span className="publication-filter-tree-node-count">
                ({toPersianDigits(node.publications.reduce((sum, p) => sum + p.issues.length, 0))} شماره)
              </span>
            )}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div style={{ marginTop: '2px', marginRight: '40px' }}>
            {Array.from(node.children.values())
              .sort((a, b) => {
                if (a.isPublication !== b.isPublication) {
                  return a.isPublication ? 1 : -1;
                }
                return a.name.localeCompare(b.name, 'fa');
              })
              .map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const selectAll = () => {
    const allPaths = new Set<string>();
    tree.forEach((node) => {
      // اضافه کردن مسیر خود node
      allPaths.add(node.fullPath);
      // اضافه کردن تمام descendantها
      getAllDescendantPaths(node).forEach((path) => allPaths.add(path));
    });
    onSelectionChange(allPaths);
  };

  const deselectAll = () => {
    onSelectionChange(new Set());
  };

  return (
    <div
      className="publication-filter-tree-container"
      style={{
        border: '1px solid rgba(32, 118, 255, 0.18)',
        borderRadius: '8px',
        padding: '15px',
        maxHeight: '500px',
        overflowY: 'auto',
      }}
    >
      <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={selectAll}
          style={{
            padding: '8px 16px',
            border: '1px solid rgba(32, 118, 255, 0.3)',
            borderRadius: '6px',
            background: 'rgba(32, 118, 255, 0.1)',
            color: 'var(--ifm-color-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(32, 118, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(32, 118, 255, 0.1)';
          }}
        >
          انتخاب همه
        </button>
        <button
          onClick={deselectAll}
          style={{
            padding: '8px 16px',
            border: '1px solid rgba(32, 118, 255, 0.3)',
            borderRadius: '6px',
            background: 'rgba(32, 118, 255, 0.1)',
            color: 'var(--ifm-color-primary)',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '500',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(32, 118, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(32, 118, 255, 0.1)';
          }}
        >
          لغو انتخاب همه
        </button>
        <div className="publication-filter-tree-selected-count" style={{ flex: 1, textAlign: 'left', paddingTop: '8px', fontSize: '12px' }}>
          {selectedPaths.size > 0 && (
            <span>
              {toPersianDigits(selectedPaths.size)} مورد انتخاب شده
            </span>
          )}
        </div>
      </div>
      <div style={{ fontSize: '14px' }}>
        {Array.from(tree.values())
          .sort((a, b) => a.name.localeCompare(b.name, 'fa'))
          .map((node) => renderNode(node))}
      </div>
    </div>
  );
}

