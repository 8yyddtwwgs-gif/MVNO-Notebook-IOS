import SwiftUI
import WebKit

@main
struct MVNONotebookApp: App {
    var body: some Scene {
        WindowGroup {
            NotebookView()
        }
    }
}

struct NotebookView: View {
    var body: some View {
        NotebookWebView()
            .ignoresSafeArea(edges: .bottom)
    }
}

struct NotebookWebView: UIViewRepresentable {
    private let homeURL = URL(string: "https://mvno-pocket-7602.activefox65.chatgpt.site/")!

    func makeCoordinator() -> Coordinator { Coordinator(home: homeURL) }

    func makeUIView(context: Context) -> WKWebView {
        let configuration = WKWebViewConfiguration()
        configuration.websiteDataStore = .default()
        configuration.defaultWebpagePreferences.allowsContentJavaScript = true
        let webView = WKWebView(frame: .zero, configuration: configuration)
        webView.navigationDelegate = context.coordinator
        webView.uiDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        webView.scrollView.contentInsetAdjustmentBehavior = .automatic
        webView.load(URLRequest(url: homeURL))
        return webView
    }

    func updateUIView(_ uiView: WKWebView, context: Context) {}

    final class Coordinator: NSObject, WKNavigationDelegate, WKUIDelegate {
        let home: URL
        init(home: URL) { self.home = home }

        func webView(_ webView: WKWebView,
                     decidePolicyFor navigationAction: WKNavigationAction,
                     decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
            guard let url = navigationAction.request.url else {
                decisionHandler(.cancel)
                return
            }
            if url.scheme == "https" || url.scheme == "http" {
                // Keep the Sites origin in-app; open other destinations in Safari.
                if url.host == home.host {
                    decisionHandler(.allow)
                } else {
                    UIApplication.shared.open(url)
                    decisionHandler(.cancel)
                }
            } else if ["tel", "mailto", "sms"].contains(url.scheme ?? "") {
                UIApplication.shared.open(url)
                decisionHandler(.cancel)
            } else {
                decisionHandler(.cancel)
            }
        }

        func webView(_ webView: WKWebView,
                     createWebViewWith configuration: WKWebViewConfiguration,
                     for navigationAction: WKNavigationAction,
                     windowFeatures: WKWindowFeatures) -> WKWebView? {
            if navigationAction.targetFrame == nil {
                if let url = navigationAction.request.url {
                    if url.host == home.host {
                        webView.load(navigationAction.request)
                    } else {
                        UIApplication.shared.open(url)
                    }
                }
            }
            return nil
        }
    }
}
