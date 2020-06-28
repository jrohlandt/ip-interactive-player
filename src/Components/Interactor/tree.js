function getRoot(flat) {
    
  for (let i = 0; i < flat.length; i++) {
      let item = {...flat[i]};
      if (item.parent_id === 0) {
          item.nodes = [];
          return item;
      }
  }

  return {};
}

function getNodes(parentId, flat) {
  let nodes = [];
  for (let i = 0; i < flat.length; i++) {
      let item = {...flat[i]};
      if (item.parent_id === parentId) {
          item.nodes = getNodes(item.id, flat);
          nodes.push(item);
      }
  }
  nodes.sort((a,b) => a.id -  b.id);
  return nodes;
}

export const buildStructure = function(flat) {
  
  let result = getRoot(flat);
  if (result.length === 0) {
      return result;
  }

  result.nodes = getNodes(result.id, flat)

  return result;
};

export const flattenStructure = function(tree) {

  let nodes = [];
  let node = {
      id: tree.id,
      parent_id: tree.parent_id,
      title: tree.title,
      url: tree.url,
  };
  nodes.push(node);

  if (typeof tree.nodes !== 'undefined' && tree.nodes.length > 0) {
      for (let i=0; i < tree.nodes.length; i++) {
          const result = flattenStructure(tree.nodes[i]);
          for (let i=0; i < result.length; i++) {
              nodes.push(result[i]);
          }
      }
  }

  nodes = nodes.sort((a,b) => a.id - b.id);
  return nodes;
}

export const findNodeById = function(nodes, id) {
    const filtered = nodes.filter(n => n.id === id);
    return filtered.length > 0 ? filtered[0] : null;
}