import SwiftUI

@main
struct MVNONotebookApp: App {
    var body: some Scene {
        WindowGroup {
            NotebookView()
        }
    }
}

struct NotebookView: View {
    @State private var reloadToken = UUID()

    var body: some View {
        WebNotebook(reloadToken: reloadToken)
            .ignoresSafeArea(edges: .bottom)
    }
}
