{
  description = "Math Worksheet Generator development environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs # Vite 7 requires Node 20.19+ / 22.12+; unstable tracks current
            direnv
            git
          ];

          shellHook = ''
            echo "Node version: $(node --version)"
            echo "npm version: $(npm --version)"
          '';

          env = {
            LANG = "C.UTF-8";
          };
        };

        formatter = pkgs.nixpkgs-fmt;
      });
}
