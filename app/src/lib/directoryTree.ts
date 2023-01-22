export class INode {
	name: string;
	parent: INode | null = null;

	constructor(name: string) {
		this.name = name;
	}

	// parses an inode from json, returns null on failure
	static fromJson(json: string): INode | null {
		function parseInode(fileData: Record<string, any>): INode {
			const name = fileData['name'];
			if (name == null) {
				throw {};
			}

			const type = fileData['type'];

			const children = fileData['children'];

			if (type == 'file' && fileData['uuid'] != null) {
				return new File(name, fileData['uuid']);
			} else if (type == 'directory' && children != null) {
				const newDirectory = new Directory(name);

				for (const data of Object.values(children)) {
					newDirectory.addChild(parseInode(data as any));
				}

				return newDirectory;
			} else {
				throw {};
			}
		}

		try {
			const jsonData = JSON.parse(json);
			return parseInode(jsonData)
		} catch (e) {
            return null;
        }
	}

	toString(): string {
		return JSON.stringify(this.serialize());
	}

	serialize(): Record<string, any> {
		throw new Error('unimplemented');
	}
}

export interface NewFile {
	name: string,
	data: ArrayBuffer,
}

export class File extends INode {
	uuid: string;
	data: Uint8Array | null = null;

	constructor(name: string, uuid: string) {
		super(name);
		this.uuid = uuid;
	}

	serialize(): Record<string, any> {
		return {
			type: 'file',
			name: this.name,
			uuid: this.uuid
		};
	}

	async deleteFromServer() {
		await fetch("/files/" + this.uuid, {
			method: "DELETE",
		});
	}
}

export class Directory extends INode {
	children: Record<string, INode> = {};

	constructor(name: string) {
		super(name);
	}

	addChild(child: INode) {
		child.parent = this;
		this.children[child.name] = child;
	}

	removeChild(name: string): INode | null {
		const child = this.children[name];
		if (child !== undefined) {
			delete this.children[name];
			return child;
		} else {
			return null;
		}
	}

	removeChildInode(inode: INode): boolean {
		if (inode.parent === this) {
			this.removeChild(inode.name);
			inode.parent = null;
			return true;
		} else {
			return false;
		}
	}

	childrenArray(): Array<INode> {
		return Object.values(this.children);
	}

	hasFile(name: string): boolean {
		return this.children[name] !== undefined;
	}

	serialize(): Record<string, any> {
		return {
			type: 'directory',
			name: this.name,
			children: this.childrenArray().map((child) => child.serialize())
		};
	}
}
