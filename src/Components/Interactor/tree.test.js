import { buildStructure, flattenStructure } from './tree.js';

test('it builds structure', () => {
    let structure = buildStructure(flat);
    expect(structure).toEqual(tree);
});

test('it flattens structure', () => {
    let flattened = flattenStructure(tree);
    expect(flattened).toEqual(flat.sort((a,b) => a.id - b.id));
});

const flat = [
    {
        id: 1888,
        parent_id: 10,
        title: 'child 1',
        url: 'https://www.youtube.com/watch?v=Sh6lK57Cuk4',
    },

    {
        id: 10,
        parent_id: 0,
        title: 'parent',
        url: 'https://www.youtube.com/watch?v=Sh6lK57Cuk4',
    },

    {
        id: 3903209,
        parent_id: 33,
        title: 'great grand child 2',
        url: '',
    },

    {
        id: 677,
        parent_id: 1888,
        title: 'grand child 1',
        url: '',
    },

    {
        id: 1889,
        parent_id: 10,
        title: 'child 2',
        url: '',
    }, 

    {
        id: 33,
        parent_id: 1889,
        title: 'grand child 2',
        url: '',
    },

    {
        id: 2903209,
        parent_id: 33,
        title: 'great grand child 1',
        url: '',
    },

    {
        id: 34,
        parent_id: 1889,
        title: 'grand child 3',
        url: '',
    },


];

const tree = {
    id: 10,
    parent_id: 0,
    title: 'parent',
    url: 'https://www.youtube.com/watch?v=Sh6lK57Cuk4',
    nodes: [
        {
            id: 1888,
            parent_id: 10,
            title: 'child 1',
            url: 'https://www.youtube.com/watch?v=Sh6lK57Cuk4',
            nodes: [
                {
                    id: 677,
                    parent_id: 1888,
                    title: 'grand child 1',
                    url: '',
                    nodes: [],
                },
            ] 
        },
        {
            id: 1889,
            parent_id: 10,
            title: 'child 2',
            url: '',
            nodes: [
                {
                    id: 33,
                    parent_id: 1889,
                    title: 'grand child 2',
                    url: '',
                    nodes: [
                        {
                            id: 2903209,
                            parent_id: 33,
                            title: 'great grand child 1',
                            url: '',
                            nodes: [],
                        },
                        {
                            id: 3903209,
                            parent_id: 33,
                            title: 'great grand child 2',
                            url: '',
                            nodes: [],
                        }
                    ] 
                },
                {
                    id: 34,
                    parent_id: 1889,
                    title: 'grand child 3',
                    url: '',
                    nodes: [],
                }
            ] 
        }
    ] 
};




